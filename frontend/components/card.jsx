import Image from "next/image"
import Products from "@/lib/dummy.js"

const Card = () => {

    const displayedProducts = Products.slice(0, 3);
    return(
        
        <>
        
         {displayedProducts.map(product => 
                    <div key={product.id}>
                        <div className="mt-5 card bg-neutral-50 w-[95%] shadow-sm mx-auto">
                            <figure>
                                <Image 
                                src={product.image}
                                width={500}
                                height={500}
                                alt={product.name}
                                />
                            </figure>
                            <div className="card-body mx-3 pb-3">
                                <h2 className="card-title font-bold text-[20px]">{product.name}</h2>
                                <p className="card-title font-bold text-[20px] mt-2 text-blue-500">
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                    }).format(product.price)}
                                </p>
                                <p className="mt-2 text-lg text-gray-600" value >Category : {product.categories}</p>
                                <p className="mt-2 text-lg text-gray-600">{product.description}</p>
                                <div className="text-center mt-2">
                                <a href="#" className="bg-blue-500 w-[100px] h-[30px] rounded group text-white mt-4 text-lg text-gray-600 block mx-auto">Buy now</a>
                                </div>
                            </div>
                       </div>
                    </div>
                   )}
            </>
    )
}

export default Card