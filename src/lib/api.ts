const BASE = {
  auth: 'https://functions.poehali.dev/75610dad-46b9-4c30-8364-5e4a67853492',
  orders: 'https://functions.poehali.dev/97a505f2-8224-4bbe-b278-e41f5c4b778a',
  prices: 'https://functions.poehali.dev/53713d73-65df-40d4-bb21-a2c5764b8e91',
  admin: 'https://functions.poehali.dev/ab9b928b-4e06-4f36-a58e-bb0fc376ef5f',
  content: 'https://functions.poehali.dev/62056199-4d94-4b9b-b810-3a4ea57f364c',
};

function getSession() {
  return localStorage.getItem('ipro_session') || '';
}

async function req(base: string, path: string, method = 'GET', body?: object) {
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': getSession(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  } catch {
    return { error: 'Ошибка соединения с сервером' };
  }
}

export const api = {
  // Auth
  register: (data: object) => req(BASE.auth, '/register', 'POST', data),
  login: (data: object) => req(BASE.auth, '/login', 'POST', data),
  logout: () => req(BASE.auth, '/logout', 'POST'),
  me: () => req(BASE.auth, '/me'),
  updateMe: (data: object) => req(BASE.auth, '/me', 'PUT', data),

  // Orders
  createOrder: (data: object) => req(BASE.orders, '/create', 'POST', data),
  myOrders: () => req(BASE.orders, '/my'),
  orderStatus: (number: string) => req(BASE.orders, `/status?number=${number}`),

  // Prices
  categories: () => req(BASE.prices, '/categories'),
  models: (slug: string) => req(BASE.prices, `/models?slug=${slug}`),
  repairTypes: (categoryId: number) => req(BASE.prices, `/repair-types?category_id=${categoryId}`),
  priceList: (modelId: number) => req(BASE.prices, `/list?model_id=${modelId}`),

  // Content
  settings: () => req(BASE.content, '/settings'),
  reviews: () => req(BASE.content, '/reviews'),
  cities: () => req(BASE.content, '/cities'),
  loyalty: () => req(BASE.content, '/loyalty'),
  addReview: (data: object) => req(BASE.content, '/reviews/add', 'POST', data),

  // Admin
  adminOrders: (status?: string) => req(BASE.admin, `/orders${status ? `?status=${status}` : ''}`),
  adminUpdateOrder: (data: object) => req(BASE.admin, '/orders/update', 'PUT', data),
  adminUsers: (search?: string) => req(BASE.admin, `/users${search ? `?search=${search}` : ''}`),
  adminBonusAdjust: (data: object) => req(BASE.admin, '/bonuses/adjust', 'POST', data),
  adminSettings: () => req(BASE.admin, '/settings'),
  adminUpdateSettings: (updates: object) => req(BASE.admin, '/settings', 'PUT', { updates }),
  adminPrices: () => req(BASE.admin, '/prices'),
  adminSavePrice: (data: object) => req(BASE.admin, '/prices', 'POST', data),
  adminReviews: () => req(BASE.admin, '/reviews'),
  adminToggleReview: (id: number) => req(BASE.admin, '/reviews/toggle', 'PUT', { id }),
  adminStats: () => req(BASE.admin, '/stats'),
  adminMakeAdmin: (data: object) => req(BASE.admin, '/make-admin', 'POST', data),
};