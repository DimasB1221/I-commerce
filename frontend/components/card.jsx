import Image from "next/image"

const Card = () => {
    return(
        <>
            <div className="card bg-base-100 w-[90%] shadow-sm mx-auto">
                <figure>
                    <Image 
                    src="/AboutUsPhoto2.jpg"
                    width={500}
                    height={500}
                    />
                </figure>
                <div className="card-body mx-3 pb-3">
                    <h2 className="card-title font-bold text-[20px]">Iphone 11</h2>
                    <p className="card-title font-bold text-[20px] mt-2 text-blue-500">Rp15.000.000</p>
                    <p className="mt-2 text-lg text-gray-600">A card component has a figure, a body part, and inside body there are title and actions parts</p>
                    <div className="text-center mt-2">
                    <a href="#" className="bg-blue-500 w-[100px] h-[30px] rounded group text-white mt-4 text-lg text-gray-600 block mx-auto">Buy now</a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Card