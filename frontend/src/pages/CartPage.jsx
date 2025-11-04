import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import styles from "./styles/CartPage.module.css";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import useDocumentTitle from '../hooks/useDocumentTitle'

const CartPage = () => {

  useDocumentTitle('Carrito')
  // 1. IMPORTAMOS LA NUEVA FUNCIÓN DEL HOOK
  const { cart, removeItem, updateItemQuantity, loading, itemCount } =
    useCart();

  if (loading) {
    return <Spinner />;
  }

  if (!cart || itemCount === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Tu Carrito de Compras está Vacío</h2>
          <p>Parece que todavía no has añadido ningún producto.</p>
          <Link to="/productos">
            <Button variant="primary">Explorar Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.cantidad * item.precio,
    0
  );
  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(cartTotal);
  const formattedSubtotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(cartTotal); // Asumiendo que no hay impuestos/envío aún

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Tu Carrito de Compras</h2>
      <div className={styles.cartGrid}>
        {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
        <div className={styles.cartItemsList}>
          {cart.items.map((item) => (
            <div key={item.producto._id} className={styles.cartItem}>
              <img
                src={item.producto.imagen || "https://via.placeholder.com/100"}
                alt={item.producto.nombre}
                className={styles.itemImage}
              />

              <div className={styles.itemDetails}>
                <h4>{item.producto.nombre}</h4>
                <p>Precio Unitario: ${item.precio.toFixed(2)}</p>

                {/* 2. NUEVOS CONTROLES DE CANTIDAD */}
                <div className={styles.quantityControl}>
                  {/* ANTES: <button> */}
                  <Button
                    variant="quantity" // Usamos nuestra nueva variante
                    onClick={() =>
                      updateItemQuantity(item.producto._id, item.cantidad - 1)
                    }
                    disabled={item.cantidad <= 1}
                  >
                    -
                  </Button>
                  <span className={styles.quantityDisplay}>
                    {item.cantidad}
                  </span>
                  {/* ANTES: <button> */}
                  <Button
                    variant="quantity" // Usamos nuestra nueva variante
                    onClick={() =>
                      updateItemQuantity(item.producto._id, item.cantidad + 1)
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                variant="danger"
                onClick={() => removeItem(item.producto._id)}
                className={styles.removeItemButton}
              >
                X
              </Button>
            </div>
          ))}
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN DE COMPRA --- */}
        <div className={styles.summary}>
          <h3>Resumen de la Compra</h3>
          <div className={styles.summaryRow}>
            <span>Subtotal ({itemCount} items)</span>
            <span>{formattedSubtotal}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>
          <Link to="/checkout">
            <Button variant="primary">
              Proceder al Pago
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
