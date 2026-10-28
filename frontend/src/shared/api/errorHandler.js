export function normalizeError(error, fallback = 'Something went wrong') {
  if (!error) {
    return { success: false, message: fallback, status: null }
  }

  if (typeof error === 'string') {
    return { success: false, message: error, status: null }
  }

  const data = error.response?.data
  const message =
    data?.message ||
    data?.error ||
    error.message ||
    fallback

  return {
    success: false,
    message: String(message),
    status: error.response?.status ?? data?.status ?? null,
  }
}

export async function parseResponseError(response, fallback = 'Request failed') {
  try {
    const data = await response.json()
    return {
      success: false,
      message: data?.message || data?.error || fallback,
      status: response.status,
    }
  } catch {
    return {
      success: false,
      message: `${fallback} (${response.status})`,
      status: response.status,
    }
  }
}
