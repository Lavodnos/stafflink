"""Cliente para enviar/descargar lotes de Smart Boleta."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable


class SmartClient:
    def __init__(self, *, output_dir: str) -> None:
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def save_batch(self, batch_code: str, rows: Iterable[list[str]]) -> str:
        file_path = self.output_dir / f"{batch_code}.csv"
        with file_path.open("w", encoding="utf-8") as handle:
            for row in rows:
                handle.write(",".join(row))
                handle.write("\n")
        return str(file_path)
