import React , {useState, useEffect} from 'react';

export const useMeetingPagination = (totalParicipantIds: string[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1); 
    const totalPages = Math.max(1,Math.ceil(totalParicipantIds.length / itemsPerPage));
    useEffect(()=>{
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]); 
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visible = totalParicipantIds.slice(startIndex, startIndex + itemsPerPage);
    return{
        visible,
        currentPage,
        setCurrentPage,
        totalPages,
        hasNextPage: startIndex + itemsPerPage < totalParicipantIds.length,
        hasPrevPage: currentPage > 1
    }
}