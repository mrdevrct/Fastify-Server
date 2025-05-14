const formatResponse = (
  data,
  hasError = false,
  message = null,
  status = 200,
  pagination = null
) => {
  const response = {
    meta: {
      has_error: hasError,
      message,
      status,
    },
  };

  // Only include data if hasError is false
  if (!hasError) {
    response.data = data;
  }

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
