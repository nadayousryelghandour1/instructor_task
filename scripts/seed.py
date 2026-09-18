"""
Seed script — brings a blank install to a fully demo-able state.

Creates two tenants (so multi-tenant isolation, twist T0, is demonstrable),
three demo users with genuinely different roles, and ingests the corpus from
the corpus/ folder.

Idempotent: re-running skips tenants, users and documents that already exist,
so it is safe to run after a partial failure (FR-1: idempotent re-ingestion).

Usage (from the repository root):
    python scripts/seed.py
    python scripts/seed.py --reset     # drop the database first
"""

import argparse
import os
import shutil
import sys
from pathlib import Path

# Make the repository root importable when run as `python scripts/seed.py`
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv()

from application.chunker import Chunker  # noqa: E402
from application.process_document import ProcessDocumentUseCase  # noqa: E402
from domain.document import Document  # noqa: E402
from domain.tenant import Tenant  # noqa: E402
from domain.user import User  # noqa: E402
from infrastructure.database import SessionLocal, engine  # noqa: E402
from infrastructure.document_chunk_repository import DocumentChunkRepository  # noqa: E402
from infrastructure.document_repository import DocumentRepository  # noqa: E402
from infrastructure.file_reader import FileReader  # noqa: E402
from infrastructure.security import hash_password  # noqa: E402
from infrastructure.tenant_repository import TenantRepository  # noqa: E402
from infrastructure.user_repository import UserRepository  # noqa: E402


CORPUS_ROOT = ROOT / "corpus"
UPLOADS_DIR = ROOT / "uploads"

CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".docx": (
        "application/vnd.openxmlformats-officedocument"
        ".wordprocessingml.document"
    ),
    ".pptx": (
        "application/vnd.openxmlformats-officedocument"
        ".presentationml.presentation"
    ),
}


# --------------------------------------------------------------------------
# Tenant / user definitions
# --------------------------------------------------------------------------

TENANTS = [
    {
        "key": "tenant_a",
        "name": "Cairo Institute of Technology",
        "users": [
            {
                "name": "Demo Admin",
                "role": "admin",
                "email_env": "SEED_ADMIN_EMAIL",
                "password_env": "SEED_ADMIN_PASSWORD",
                "email_default": "admin@teachpilot.local",
            },
            {
                "name": "Demo Lead Instructor",
                "role": "lead_instructor",
                "email_env": "SEED_LEAD_EMAIL",
                "password_env": "SEED_LEAD_PASSWORD",
                "email_default": "lead@teachpilot.local",
            },
            {
                "name": "Demo Instructor",
                "role": "instructor",
                "email_env": "SEED_INSTRUCTOR_EMAIL",
                "password_env": "SEED_INSTRUCTOR_PASSWORD",
                "email_default": "instructor@teachpilot.local",
            },
        ],
    },
    {
        # Second tenant exists so cross-tenant isolation can be demonstrated
        # live, not just asserted in a unit test.
        "key": "tenant_b",
        "name": "Alexandria Technical Academy",
        "users": [
            {
                "name": "Rival Admin",
                "role": "admin",
                "email_env": "SEED_RIVAL_EMAIL",
                "password_env": "SEED_RIVAL_PASSWORD",
                "email_default": "rival@other-tenant.local",
            },
        ],
    },
]


def env(name: str, default: str) -> str:
    value = os.getenv(name)
    return value if value else default


# --------------------------------------------------------------------------
# Steps
# --------------------------------------------------------------------------


def reset_database() -> None:
    db_path = ROOT / "domain_copilot.db"
    if db_path.exists():
        db_path.unlink()
        print(f"  removed {db_path.name}")
    if UPLOADS_DIR.exists():
        shutil.rmtree(UPLOADS_DIR)
        print("  removed uploads/")
    # Recreate the schema on the fresh file.
    from infrastructure.models import Base

    Base.metadata.create_all(engine)
    print("  schema recreated")


def ensure_tenant(tenant_repository, name: str) -> Tenant:
    for existing in tenant_repository.get_all_tanents():
        if existing.name == name:
            print(f"  tenant already exists: {name}")
            return existing

    tenant = tenant_repository.add_tanent(Tenant(name=name))
    print(f"  created tenant: {name} ({tenant.id})")
    return tenant


def ensure_user(user_repository, tenant_id: str, spec: dict) -> None:
    email = env(spec["email_env"], spec["email_default"])
    password = env(spec["password_env"], "ChangeMe123!")

    if user_repository.get_user_by_email(email) is not None:
        print(f"  user already exists: {email}")
        return

    user_repository.add_user(
        User(
            name=spec["name"],
            email=email,
            hashed_password=hash_password(password),
            tenant_id=tenant_id,
            role=spec["role"],
        )
    )
    print(f"  created user: {email}  (role={spec['role']})")


def ingest_folder(session, tenant, folder: Path) -> None:
    if not folder.exists():
        print(f"  !! corpus folder missing: {folder}")
        print("     put this tenant's documents there and re-run.")
        return

    document_repository = DocumentRepository(session)
    chunk_repository = DocumentChunkRepository(session)

    process = ProcessDocumentUseCase(
        file_reader=FileReader(),
        chunker=Chunker(),
        chunk_repository=chunk_repository,
        document_repository=document_repository,
    )

    already = {
        doc.title
        for doc in document_repository.get_documents_by_tenant_id(tenant.id)
        if doc.status == "processed"
    }

    files = sorted(
        path
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in CONTENT_TYPES
    )

    if not files:
        print(f"  !! no supported files in {folder}")
        return

    UPLOADS_DIR.mkdir(exist_ok=True)

    succeeded = 0
    failed = []

    for index, path in enumerate(files, start=1):
        if path.name in already:
            print(f"  [{index}/{len(files)}] skip (already ingested): {path.name}")
            succeeded += 1
            continue

        document = Document(
            title=path.name,
            tenant_id=tenant.id,
            specialization="general",
            status="uploaded",
        )

        stored_path = UPLOADS_DIR / f"{document.id}_{path.name}"
        shutil.copy2(path, stored_path)

        document_repository.add_document(document)

        print(f"  [{index}/{len(files)}] ingesting {path.name} ...", end=" ", flush=True)

        try:
            process.execute(
                tenant_id=tenant.id,
                document_id=document.id,
                file_path=str(stored_path),
                content_type=CONTENT_TYPES[path.suffix.lower()],
            )
        except Exception as error:  # noqa: BLE001 - reported, not swallowed
            print(f"FAILED: {error}")
            failed.append((path.name, str(error)))
            continue

        chunk_count = len(
            chunk_repository.get_chunks_by_document_id(tenant.id, document.id)
        )
        print(f"ok ({chunk_count} chunks)")
        succeeded += 1

    print(f"  -> {succeeded}/{len(files)} documents ingested for {tenant.name}")

    if failed:
        print("  -> failures (per-document status is recorded as 'failed'):")
        for name, error in failed:
            print(f"     - {name}: {error}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed TeachPilot.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="delete the local database and uploads before seeding",
    )
    args = parser.parse_args()

    if args.reset:
        print("\n== Resetting local state ==")
        reset_database()

    session = SessionLocal()

    try:
        tenant_repository = TenantRepository(session)
        user_repository = UserRepository(session)

        for spec in TENANTS:
            print(f"\n== {spec['name']} ==")
            tenant = ensure_tenant(tenant_repository, spec["name"])

            for user_spec in spec["users"]:
                ensure_user(user_repository, tenant.id, user_spec)

            ingest_folder(session, tenant, CORPUS_ROOT / spec["key"])

        print("\n== Done ==")
        print("Demo accounts:")
        for spec in TENANTS:
            for user_spec in spec["users"]:
                print(
                    f"  {env(user_spec['email_env'], user_spec['email_default']):<32}"
                    f" {user_spec['role']:<16} ({spec['name']})"
                )
        print("\nStart the API with:  uvicorn main:app --reload")

    finally:
        session.close()


if __name__ == "__main__":
    main()
