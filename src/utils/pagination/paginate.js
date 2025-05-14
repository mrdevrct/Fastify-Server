const paginate = ({ total, page, perPage }) => {
  const totalPage = Math.max(Math.ceil(total / perPage), 1);
  const currentPage = Math.max(parseInt(page) || 1, 1);

  return {
    total,
    totalPage,
    currentPage,
    nextPage: currentPage < totalPage ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

module.exports = { paginate };
