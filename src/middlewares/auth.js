export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Iniciar sesion para acceder a esta pagina' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Solo los administradores pueden acceder a esta pagina' });
  }
};

export const isUser = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'usuario') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Solo los usuarios pueden acceder a esta pagina' });
  }
};

export const isPremium = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'premium') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Solo los usuarios premium pueden acceder a esta pagina' });
  }
};
