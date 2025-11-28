import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar1 from "@/components/sidebar"
import ProductForm from "./productForm.jsx";
import ProductDisplay from "./productsDisplay.jsx";

export default function ProductPage() {
    return (
        <>
            <header>
                <Sidebar1 />
            </header>
            <main className="min-h-screen bg-neutral-100 py-4">
                {/* Input section */}
                <section className="w-full max-w-sm space-y-2 mx-2">
                    <Label htmlFor="search-input" className="text-blue-500 font-bold mx-1">Search Product</Label>
                    <div className="relative">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="bg-background pl-9"
                            id="search-input"
                            placeholder="Search..."
                            type="search"
                        />
                    </div>
                </section>
                {/* Create New Product Section */}
                <section>
                    <ProductForm />
                </section>
                {/* Table section */}
                <section className="bg-background mt-5 mx-2 rounded-lg shadow">
                    <ProductDisplay />
                </section>
            </main>
        </>
    )
}