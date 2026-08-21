import { StatusBadge } from "@/components/StatusBadge";
import { ProductFormModal } from "@/components/ProductFormModal";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { useProductsStore, type Product, type ProductCategory } from "@/store/productsStore";
import { Plus, Search, Edit2, Trash2, Package, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { DataTable } from "@/components/table/Datatable";

const CATEGORIES: ProductCategory[] = ["Chemicals", "Equipment", "Supplies", "Services", "Other"];

const ProductsPage = () => {
  const { products, deleteProduct, getProductsByCategory, updateProduct } = useProductsStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pagination = usePagination({
    items: filtered,
    itemsPerPage: 10,
  });

  const activeProducts = products.filter((p) => p.status === "Active").length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.unitPrice, 0);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
      toast.success(`Product deleted: ${name}`);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedProduct(undefined);
  };

  const productTableData = pagination.paginatedItems.map((product, index) => ({
  ...product,
  serialNumber: pagination.startIndex + index + 1,
}));

const productColumns = [
  {
    key: "serialNumber",
    header: "#",
    render: (product: any) => (
      <span className="text-xs text-muted-foreground font-medium">
        {product.serialNumber}
      </span>
    ),
  },
  {
    key: "id",
    header: "Product ID",
    render: (product: any) => (
      <span className="font-medium text-card-foreground text-xs">
        {product.id}
      </span>
    ),
  },
  {
    key: "name",
    header: "Name",
    render: (product: any) => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <span className="text-card-foreground text-xs">
          {product.name}
        </span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (product: any) => (
      <span className="text-muted-foreground text-xs">
        {product.category}
      </span>
    ),
  },
  {
    key: "unitOfMeasurement",
    header: "Unit",
    render: (product: any) => (
      <span className="text-muted-foreground text-xs">
        {product.unitOfMeasurement}
      </span>
    ),
  },
  {
    key: "unitPrice",
    header: "Price",
    render: (product: any) => (
      <span className="font-semibold text-card-foreground text-xs">
        ₹{product.unitPrice}
      </span>
    ),
  },
  {
    key: "status",
    header: "Active/Inactive",
    render: (product: any) => (
      <button
        onClick={(e) => {
          e.stopPropagation();

          updateProduct(product.id, {
            status:
              product.status === "Active"
                ? "Inactive"
                : "Active",
          });
        }}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          product.status === "Active"
            ? "bg-green-500"
            : "bg-muted"
        }`}
        title={product.status}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            product.status === "Active"
              ? "translate-x-4"
              : "translate-x-1"
          }`}
        />
      </button>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (product: any) => (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleEdit(product)}
          className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            handleDelete(product.id, product.name)
          }
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">Manage product catalog and pricing</p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)] transition-all"
          style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Products</p>
          <p className="text-2xl font-bold text-card-foreground">{products.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Active Products</p>
          <p className="text-2xl font-bold text-card-foreground">{activeProducts}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Categories</p>
          <p className="text-2xl font-bold text-card-foreground">{new Set(products.map((p) => p.category)).size}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-xs text-muted-foreground font-medium mb-1">Avg Price</p>
          <p className="text-2xl font-bold text-card-foreground">₹{Math.round(totalInventoryValue / products.length)}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === "All"
              ? "bg-primary text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
              : "bg-secondary text-card-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary text-white shadow-[0px_5px_12px_rgba(39,47,158,0.2)]"
                : "bg-secondary text-card-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
  <DataTable
    columns={productColumns}
    data={productTableData}
    getRowKey={(product) => product.id}
    onRowClick={(product) => {
      setDetailsProduct(product);
      setShowDetails(true);
    }}
    emptyMessage="No products found"
  />
</div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={filtered.length}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
      />

      <ProductFormModal open={showForm} mode={formMode} product={selectedProduct} onClose={handleFormClose} />
      <ProductDetailsModal open={showDetails} product={detailsProduct} onClose={() => setShowDetails(false)} />
    </div>
  );
};

export default ProductsPage;
