from pathlib import Path

import psycopg
from dotenv import dotenv_values
from fastmcp import FastMCP
from psycopg.rows import dict_row

mcp = FastMCP("mini-inventario")
ENV_PATH = Path(__file__).resolve().with_name(".env")
MAX_RESULTADOS = 50


def _consultar(sql: str, parametros: tuple) -> list[dict]:
    database_url = dotenv_values(ENV_PATH, interpolate=False).get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Configura DATABASE_URL en mcp-inventario/.env.")

    try:
        with psycopg.connect(
            database_url, connect_timeout=5, row_factory=dict_row
        ) as conexion:
            conexion.read_only = True
            return conexion.execute(sql, parametros).fetchall()
    except psycopg.Error:
        raise RuntimeError("No se pudo consultar la base de datos.") from None


@mcp.tool()
def buscar_producto(nombre: str) -> list[dict]:
    """Busca productos cuyo nombre contiene el texto, sin distinguir mayúsculas."""
    nombre = nombre.strip()
    if not nombre:
        return []

    return _consultar(
        """
        SELECT nombre, sku, cantidad, minimo
        FROM public.productos
        WHERE strpos(lower(nombre), lower(%s)) > 0
        ORDER BY nombre, sku, id
        LIMIT %s
        """,
        (nombre, MAX_RESULTADOS),
    )


@mcp.tool()
def stock_bajo() -> list[dict]:
    """Lista los productos cuya cantidad está por debajo del mínimo."""
    return _consultar(
        """
        SELECT nombre, sku, cantidad, minimo
        FROM public.productos
        WHERE cantidad < minimo
        ORDER BY cantidad, nombre, sku, id
        LIMIT %s
        """,
        (MAX_RESULTADOS,),
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
