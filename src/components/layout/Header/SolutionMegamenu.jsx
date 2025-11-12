import {React, useState} from 'react'
import {SOLUTIONS} from './data'

const SolutionMegamenu = () =>  {
    // cái đầu tiên được hover
    const [hightlightedProduct, setHightlighted] = useState(SOLUTIONS[0].items[0])
    // hàm xử lí render 
    const handleMouseEnter  = (item) => {
        setHightlighted(item);
    }

    const renderSolutionColumn = (category) => {
        return(
            <div key={category.category} className="flex flex-col space-y-1">
                <h3 className ="text-sm font-semibold text-gray-400 mb-2">{category.category}</h3>
                <ul className="list-none p-0 m-0 space-y-1">
                    {category.items.map((item)=> {
                        const isHightlighted = hightlightedProduct && hightlightedProduct.id === item.id;
                        return(
                            <li
                                key = {item.id}
                                className = {`flex items-center p-2 rounded-lg cursor-pointer transition duration-200 easin-in-out
                                ${isHightlighted ? 'bg-blue-50 text-blue-600': 'text-gray-900 hover:bg-gray-100'}
                                    `}
                                onMouseEnter={() => handleMouseEnter(item)}
                            >
                                <span className="text-sm font-medium">{item.name}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )

    }
    // render ảnh cột còn lại 
    const renderHightlightedSection = () =>  {
        return(
            <div className="col-span-2 border-l border-gray-200 pl-8 space-y-4">
                <div className="relative h-50 w-full overflow-hidden rounded-lg shadow-md">
                    <img src="https://st1.zoom.us/homepage/publish/primary/assets/images/customer-story.webp" alt="" />
                </div>
                <div className="mb-2 mt-4">
                    <span className="inline-block text-[20px] font-bold uppercase tracking-wider rounded">
                        Inspiring stories of customer success
                    </span>
                </div>
            </div>
        )
    }
    return (
        <section className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl" aria-label="Solutions Megamenu">
            <div className="grid grid-cols-6 gap-8">
                
                {/* 1. Cột Chính - Chứa 4 cột con Solution */}
                <div className="col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {SOLUTIONS.map(renderSolutionColumn)}
                </div>

                {/* 2. Cột Nội dung Nổi bật (Featured Content) */}
                {hightlightedProduct && renderHightlightedSection()}
                
                
            </div>
        </section>
    );
    

}

export default SolutionMegamenu;