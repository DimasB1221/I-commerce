"use client";
import Image from "next/image";
import Navbar from "../components/navbar.jsx";
import Hero from "@/components/hero.jsx";
import Card from "@/components/card.jsx";
import Footer from "@/components/footer.jsx";
import { getProducts } from "@/lib/productServices.js";
import { useState, useEffect } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await getProducts(1, 3);
      if (response && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      {/* navbar section */}
      <header>
        <Navbar />
      </header>
      <main className="overflow-x-hidden">
        {/* Hero section */}
        <Hero />
        {/* About us section */}
        <section id="product" className="about-us mx-auto ">
          <div className="about-header text-center">
            <h1 className="mt-5 text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              About us
            </h1>
            <Image
              src="/AboutUsPhoto3.jpg"
              alt="iphone"
              width={900}
              height={500}
              className="w-[100%] m-auto md:h-[500px]"
            />
          </div>
          <div className="about-body m-3">
            <p className=" text-lg text-gray-600">
              Welcome to iDimas Store, your trusted destination for everything
              Apple. We are passionate about bringing the best of Apple
              technology closer to you — from the latest iPhones and MacBooks to
              essential accessories that elevate your experience. At iDimas
              Store, we believe innovation should be simple, elegant, and
              accessible. That’s why we focus on providing authentic products,
              competitive prices, and exceptional customer service. Whether
              you’re upgrading your device, exploring new gadgets, or seeking
              expert advice, our team is here to help you every step of the way.
              Experience the world of Apple — redefined, reliable, and ready for
              you.
            </p>
          </div>
        </section>
        {/* Product section */}
        <section className="product">
          <h1 className="mt-5 text-5xl md:text-6xl font-bold text-gray-900 leading-tight text-center ">
            Product
          </h1>
          <div className="product-body mb-5 grid sm:w-[80vw] md:grid-cols-2 md:w-[80vw] gap-2 lg:w-[95vw] lg:grid-cols-3 mx-auto xl:w-[90vw]">
            {products.map((product) => (
              <Card
                key={product._id}
                name={product.name}
                price={product.price}
                image={product.images}
                description={product.description}
                categories={product.category}
              />
            ))}
          </div>
        </section>
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
}
