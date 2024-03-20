export const checkRole = (role) => {
  return (req, res, next) => {
      if (req.session && req.session.user && req.session.user.role === role) {
          next();
      } else {
          res.status(403).json({ message: 'Acceso denegado' });
      }
  };
};

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      next();
  } else {
      res.status(401).json({ message: 'No autenticado' });
  }
};
