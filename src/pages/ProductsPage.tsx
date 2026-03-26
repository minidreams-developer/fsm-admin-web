import { StatusBadge } from "@/components/StatusBadge";
import { ProductFormModal } from "@/components/ProductFormModal";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { useProductsStore, type Product, type ProductCategory } from "@/store/productsStore";
import { Plus, Search, Edit2, Trash2, Package, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES: ProductCategory[] = ["Chemicals", "Equipment", "Supplies", "Services", "Other"];

const ProductsPage = () => {
  const { products, deleteProduct, getProductsByCategory } = useProductsStore();
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Product ID", "Name", "Category", "Unit", "Price", "Reorder Level", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-card-foreground">{product.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-card-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{product.category}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{product.unitOfMeasurement}</td>
                    <td className="px-5 py-3.5 font-semibold text-card-foreground">₹{product.unitPrice}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{product.reorderLevel}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={product.status} variant={product.status === "Active" ? "success" : "warning"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDetailsProduct(product);
                            setShowDetails(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal open={showForm} mode={formMode} product={selectedProduct} onClose={handleFormClose} />
      <ProductDetailsModal open={showDetails} product={detailsProduct} onClose={() => setShowDetails(false)} />
    </div>
  );
};

export default ProductsPage;
