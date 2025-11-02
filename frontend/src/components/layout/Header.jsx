import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import Button from "../ui/Button";
import styles from "./Header.module.css";

// Sub-componente con los enlaces de navegación
const NavLinks = ({ onLinkClick }) => {
  const { isAuthenticated, usuario } = useAuth();
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();

  const handlePrivateLinkClick = (e, path) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Debes iniciar sesión para acceder.");
      navigate("/auth");
    } else {
      navigate(path);
    }
    if (onLinkClick) onLinkClick();
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      openCart();
    } else {
      toast.info("Debes iniciar sesión para ver tu carrito.");
      navigate("/auth");
    }
    if (onLinkClick) onLinkClick();
  };

  return (
    <>
      {usuario?.rol !== "admin" && (
        <>
          <Button to="/" variant="link" onClick={onLinkClick}>Inicio</Button>
          <Button to="/productos" variant="link" onClick={onLinkClick}>Catálogo</Button>
        </>
      )}
      <Button to="/perfil" variant="link" onClick={(e) => handlePrivateLinkClick(e, "/perfil")}>
        Mi Perfil
      </Button>
      {usuario?.rol !== "admin" && (
        <>
          <Button to="/mis-pedidos" variant="link" onClick={(e) => handlePrivateLinkClick(e, "/mis-pedidos")}>
            Mis Pedidos
          </Button>
          <Button variant="link" onClick={handleCartClick}>
            Carrito ({itemCount})
          </Button>
        </>
      )}
      {isAuthenticated && usuario.rol === "admin" && (
        <Button to="/admin" variant="primary" onClick={onLinkClick}>
          Panel Admin
        </Button>
      )}
    </>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  // Efecto para agregar una sombra o fondo distinto al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.leftSection}>
        <Link to="/" className={styles.logo}>
          <img src="https://res.cloudinary.com/drk7ixxdm/image/upload/v1761801097/logo-e-_xygea1.svg" alt="Logo E.N." className={styles.logoImg} />
        </Link>
      </div>

      <div className={styles.centerSection}>
        <Link to="/" className={styles.storeLink}>
          <h1 className={styles.storeTitle}>EN S.A.</h1>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <nav className={styles.desktopNav}>
          <NavLinks />
        </nav>

        <button
          className={`${styles.hamburgerButton} ${isMenuOpen ? styles.active : ""}`}
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.isOpen : ""}`}
        onClick={closeMenu}
      >
        <nav className={styles.mobileNavLinks} onClick={(e) => e.stopPropagation()}>
          <NavLinks onLinkClick={closeMenu} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
