import React from "react";

const HeroSection = () => {
    return(
        <div className="bg-[#0d11a] p-0 sm:p-8 lg:p-12 py-20 flex justify-center">
            <section
            className="w-full max-w-7xl mx-auto rounded-xl p-8 sm:p-12 md:p-16 lg:p-20"
            style={{ 
                 background: 'linear-gradient(135deg, #1f295e 0%, #0d1b3f 100%)',
                minHeight: '400px'
          
        }}  
            >
            
            <div className="text-center max-w-4xl space-y-6 sm:space-y-8 m-auto">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight">
                    Find out what' s possible when work connects
                </h1>
                <p className="text-base sm:text-lg text-indigo-200/90 mx-auto max-w-xl">
                    Whether you're chatting with teammates or supporting customers, Zoom makes it easier to connect, collaborate, and reach goals — all with built-in AI doing the heavy lifting.
                </p>
                {/* Nút */}
                <div className="flex flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                    {/* Nút CTA */}
                    <button className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-semibold cursor-pointer rounded-lg
                    hover:bg-indigo-800 transition duration-300 transform hover:scale[1.05] active:scale-100">
                        Explore products
                    </button>
                    <button className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-700 font-semibold cursor-pointer rounded-lg
                    hover:bg-gray-100 transition duration-300 transform hover:scale-[1.05] active:scale-100 
                         border border-transparent hover:border-indigo-300
                         ">
                        Find your plan
                    </button>
                </div>
            </div>

            </section>

        </div>
    )
}


export default HeroSection; 
