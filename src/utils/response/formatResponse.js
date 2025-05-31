const formatResponse = (
  data = null,
  hasError = false,
  message = null,
  status = 200,
  pagination = null
) => {
  const response = {
    data: hasError ? null : data || [],
    meta: {
      has_error: hasError,
      message: hasError ? message || "An error occurred" : null,
      status,
    },
  };

  if (pagination) {
    response.meta.pagination = {
      total: pagination.total || 0,
      totalPage: pagination.totalPage || 0,
      currentPage: pagination.currentPage || 1,
      nextPage: pagination.nextPage || null,
      prevPage: pagination.prevPage || null,
    };
  }

  return response;
};

module.exports = { formatResponse };
