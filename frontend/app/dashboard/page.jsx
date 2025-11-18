import Sidebar1 from "@/components/sidebar"
import { Store } from 'lucide-react';



export default function Dashboard (){
    return (
        <>
            <header className="">
                <Sidebar1/>
            </header>
            <main className="h-screen bg-neutral-100 py-4">
                <ul className="admin-info grid gap-5 w-[95%] m-auto">
                    <li className=" info-card shadow-top-bottom-soft"> 
                        <p className="col-span-2 ">Product</p>
                        <h1 className="">100</h1>
                        <Store className=" self-start justify-self-end"/>
                    </li>
                    <li className="info-card shadow-top-bottom-soft">
                        <p className="col-span-3">Stock</p>
                        <h1>100</h1>
                        <Store className="self-start justify-self-end "/>
                    </li>
                    <li className="info-card shadow-top-bottom-soft">
                        <p className="col-span-3">Categories</p>
                        <h1>100</h1>
                         <Store className="self-start justify-self-end"/>
                    </li>
                </ul>
            </main>

            
        </>
    )
}