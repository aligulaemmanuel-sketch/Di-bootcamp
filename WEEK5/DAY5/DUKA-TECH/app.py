from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from faker import Faker
from flask import Flask, jsonify, request, send_file

app = Flask(__name__, static_url_path="", static_folder=".")

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "duka_db.json"


@dataclass
class Product:
    id: int
    name: str
    category: str
    stock: int
    price: float
    threshold: int = 5
    unit: str = "unit"

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Product":
        return cls(
            id=int(data["id"]),
            name=data["name"],
            category=data["category"],
            stock=int(data["stock"]),
            price=float(data["price"]),
            threshold=int(data.get("threshold", 5)),
            unit=data.get("unit", "unit"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Sale:
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    customer: str
    timestamp: str

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Sale":
        return cls(
            id=int(data["id"]),
            product_id=int(data["product_id"]),
            product_name=data["product_name"],
            quantity=int(data["quantity"]),
            unit_price=float(data["unit_price"]),
            customer=data.get("customer", "Walk-in"),
            timestamp=data.get("timestamp", datetime.now().isoformat()),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Supplier:
    id: int
    name: str
    phone: str
    product: str
    balance: float
    last_purchase: str

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Supplier":
        return cls(
            id=int(data["id"]),
            name=data["name"],
            phone=data.get("phone", "N/A"),
            product=data["product"],
            balance=float(data.get("balance", 0)),
            last_purchase=data.get("last_purchase", datetime.now().strftime("%Y-%m-%d")),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class DukaStore:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        DATA_DIR.mkdir(exist_ok=True, parents=True)

        if not self.file_path.exists():
            self._seed_data()
        self.products = []
        self.sales = []
        self.suppliers = []
        self._load()

    def _seed_data(self) -> None:
        fake = Faker()

        products = [
            Product(1, "Bread", "Bakery", 4, 60, 5, "loaf"),
            Product(2, "Milk", "Dairy", 18, 70, 8, "packet"),
            Product(3, "Soap", "Household", 11, 140, 6, "bar"),
            Product(4, "Rice", "Staples", 30, 260, 10, "bag"),
        ]

        sales = [
            Sale(101, 1, "Bread", 2, 60, "Amina", "2026-09-18T08:15:00"),
            Sale(102, 2, "Milk", 3, 70, "Kibet", "2026-09-18T10:05:00"),
            Sale(103, 3, "Soap", 2, 140, "Walk-in", "2026-09-18T12:40:00"),
        ]

        suppliers = [
            Supplier(201, fake.company(), "0700-111-222", "Bread", 2500, "2026-09-12"),
            Supplier(202, fake.company(), "0722-555-111", "Milk", 1300, "2026-09-15"),
        ]

        self.products = products
        self.sales = sales
        self.suppliers = suppliers
        self._save()

    def _load(self) -> None:
        with self.file_path.open("r", encoding="utf-8") as file:
            raw_data = json.load(file)

        self.products = [Product.from_dict(item) for item in raw_data.get("products", [])]
        self.sales = [Sale.from_dict(item) for item in raw_data.get("sales", [])]
        self.suppliers = [Supplier.from_dict(item) for item in raw_data.get("suppliers", [])]

    def _save(self) -> None:
        payload = {
            "products": [product.to_dict() for product in self.products],
            "sales": [sale.to_dict() for sale in self.sales],
            "suppliers": [supplier.to_dict() for supplier in self.suppliers],
        }

        with self.file_path.open("w", encoding="utf-8") as file:
            json.dump(payload, file, indent=2)

    def add_product(self, payload: dict[str, Any]) -> Product:
        product = Product(
            id=int(payload.get("id", datetime.now().timestamp() * 1000)),
            name=str(payload["name"]).strip(),
            category=str(payload["category"]).strip(),
            stock=int(payload["stock"]),
            price=float(payload["price"]),
            threshold=int(payload.get("threshold", 5)),
            unit=str(payload.get("unit", "unit")).strip() or "unit",
        )
        self.products.append(product)
        self._save()
        return product

    def record_sale(self, payload: dict[str, Any]) -> Sale:
        product_id = int(payload["productId"])
        quantity = int(payload["quantity"])
        customer = str(payload.get("customer", "Walk-in")).strip() or "Walk-in"

        product = next((item for item in self.products if item.id == product_id), None)
        if product is None:
            raise ValueError("Product not found.")
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")
        if product.stock < quantity:
            raise ValueError("Not enough stock available for this sale.")

        product.stock -= quantity

        sale = Sale(
            id=int(datetime.now().timestamp() * 1000),
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            unit_price=product.price,
            customer=customer,
            timestamp=datetime.now().isoformat(),
        )
        self.sales.append(sale)
        self._save()
        return sale

    def add_supplier(self, payload: dict[str, Any]) -> Supplier:
        supplier = Supplier(
            id=int(payload.get("id", datetime.now().timestamp() * 1000)),
            name=str(payload["name"]).strip(),
            phone=str(payload.get("phone", "N/A")).strip() or "N/A",
            product=str(payload["product"]).strip(),
            balance=float(payload.get("balance", 0)),
            last_purchase=str(payload.get("lastPurchase") or datetime.now().strftime("%Y-%m-%d")),
        )
        self.suppliers.append(supplier)
        self._save()
        return supplier

    def summary(self) -> dict[str, Any]:
        total_revenue = sum(sale.quantity * sale.unit_price for sale in self.sales)
        sales_by_product: dict[str, int] = {}
        for sale in self.sales:
            sales_by_product[sale.product_name] = sales_by_product.get(sale.product_name, 0) + sale.quantity

        best_seller = None
        if sales_by_product:
            best_name, best_quantity = max(sales_by_product.items(), key=lambda item: item[1])
            best_seller = {"name": best_name, "quantity": best_quantity}

        return {
            "totalRevenue": total_revenue,
            "totalSales": len(self.sales),
            "totalProducts": len(self.products),
            "lowStockItems": sum(1 for product in self.products if product.stock < product.threshold),
            "bestSeller": best_seller,
            "totalInventory": sum(product.stock for product in self.products),
        }


store = DukaStore(DATA_FILE)


@app.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok", "message": "Duka-Tech backend running"})


@app.get("/api/products")
def get_products() -> Any:
    return jsonify([product.to_dict() for product in store.products])


@app.post("/api/products")
def create_product() -> Any:
    payload = request.get_json(silent=True) or {}
    try:
        product = store.add_product(payload)
        return jsonify(product.to_dict()), 201
    except Exception as exc:  # pragma: no cover
        return jsonify({"message": str(exc)}), 400


@app.put("/api/products/<int:product_id>")
def update_product(product_id: int) -> Any:
    payload = request.get_json(silent=True) or {}
    product = next((item for item in store.products if item.id == product_id), None)
    if product is None:
        return jsonify({"message": "Product not found."}), 404

    product.name = str(payload.get("name", product.name)).strip() or product.name
    product.category = str(payload.get("category", product.category)).strip() or product.category
    product.stock = int(payload.get("stock", product.stock))
    product.price = float(payload.get("price", product.price))
    product.threshold = int(payload.get("threshold", product.threshold))
    product.unit = str(payload.get("unit", product.unit)).strip() or product.unit

    store._save()
    return jsonify(product.to_dict())


@app.delete("/api/products/<int:product_id>")
def delete_product(product_id: int) -> Any:
    product = next((item for item in store.products if item.id == product_id), None)
    if product is None:
        return jsonify({"message": "Product not found."}), 404

    store.products = [item for item in store.products if item.id != product_id]
    store.sales = [sale for sale in store.sales if sale.product_id != product_id]
    store._save()
    return jsonify({"message": "Product deleted successfully."})


@app.get("/api/sales")
def get_sales() -> Any:
    return jsonify([sale.to_dict() for sale in sorted(store.sales, key=lambda item: item.timestamp, reverse=True)])


@app.post("/api/sales")
def create_sale() -> Any:
    payload = request.get_json(silent=True) or {}
    try:
        sale = store.record_sale(payload)
        return jsonify(sale.to_dict()), 201
    except Exception as exc:  # pragma: no cover
        return jsonify({"message": str(exc)}), 400


@app.get("/api/suppliers")
def get_suppliers() -> Any:
    return jsonify([supplier.to_dict() for supplier in store.suppliers])


@app.post("/api/suppliers")
def create_supplier() -> Any:
    payload = request.get_json(silent=True) or {}
    try:
        supplier = store.add_supplier(payload)
        return jsonify(supplier.to_dict()), 201
    except Exception as exc:  # pragma: no cover
        return jsonify({"message": str(exc)}), 400


@app.put("/api/suppliers/<int:supplier_id>")
def update_supplier(supplier_id: int) -> Any:
    payload = request.get_json(silent=True) or {}
    supplier = next((item for item in store.suppliers if item.id == supplier_id), None)
    if supplier is None:
        return jsonify({"message": "Supplier not found."}), 404

    supplier.name = str(payload.get("name", supplier.name)).strip() or supplier.name
    supplier.phone = str(payload.get("phone", supplier.phone)).strip() or supplier.phone
    supplier.product = str(payload.get("product", supplier.product)).strip() or supplier.product
    supplier.balance = float(payload.get("balance", supplier.balance))
    supplier.last_purchase = str(payload.get("lastPurchase", supplier.last_purchase)).strip() or supplier.last_purchase

    store._save()
    return jsonify(supplier.to_dict())


@app.delete("/api/suppliers/<int:supplier_id>")
def delete_supplier(supplier_id: int) -> Any:
    supplier = next((item for item in store.suppliers if item.id == supplier_id), None)
    if supplier is None:
        return jsonify({"message": "Supplier not found."}), 404

    store.suppliers = [item for item in store.suppliers if item.id != supplier_id]
    store._save()
    return jsonify({"message": "Supplier deleted successfully."})


@app.get("/api/summary")
def get_summary() -> Any:
    return jsonify(store.summary())


@app.route("/")
def index() -> Any:
    return send_file(BASE_DIR / "login.html")


@app.route("/login")
def login_page() -> Any:
    return send_file(BASE_DIR / "login.html")


@app.route("/manager")
def manager_page() -> Any:
    return send_file(BASE_DIR / "manager.html")


@app.route("/customer")
def customer_page() -> Any:
    return send_file(BASE_DIR / "customer.html")


@app.route("/<path:filename>")
def static_files(filename: str) -> Any:
    file_path = BASE_DIR / filename
    if file_path.exists() and file_path.is_file():
        return send_file(file_path)
    return send_file(BASE_DIR / "manager.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
