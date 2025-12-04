-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2025 a las 01:55:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mecanosoft`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_gasto`
--

CREATE TABLE `categoria_gasto` (
  `id_cate_gasto` int(11) NOT NULL,
  `nombre_cate` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `apellido` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `direccion` varchar(45) NOT NULL,
  `telefono` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`cedula`, `nombre`, `apellido`, `id_cliente`, `correo`, `direccion`, `telefono`) VALUES
('10636307', 'Maria', 'Romero', 3, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('106363010', 'Maria', 'Romerotee', 4, 'mariamilagro@gmail.coms', 'La Miel', '0424528464'),
('10446307', 'Maria', 'Romero', 6, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('10444407', 'Maria', 'Romero', 7, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('10475865', 'Maria', 'Romera', 9, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('104745565', 'Maria', 'Romera', 10, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('147522565', 'Maria', 'Romera', 11, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('14733565', 'Maria', 'Romera', 12, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('15866565', 'Maria', 'Romera', 13, 'mariamilagro@gmail.coms', 'La Miel', '042452844864'),
('21586987', 'Jose', 'Perez', 16, 'josesitoperez@gmail.com', 'La Miel', '04160196364');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra_repuesto`
--

CREATE TABLE `compra_repuesto` (
  `id_compra_repuesto` int(11) NOT NULL,
  `precio_unitario_compra` decimal(12,2) NOT NULL,
  `fecha_compra` date NOT NULL,
  `cantidad_comprada` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `concepto_cobro`
--

CREATE TABLE `concepto_cobro` (
  `id_concepto_cuenta_por_cobrar` int(11) NOT NULL,
  `monto_a_cobrar` decimal(10,0) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado_cobro` varchar(45) NOT NULL,
  `id_factura` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `concepto_pago`
--

CREATE TABLE `concepto_pago` (
  `id_concepto_cuenta_por_pagar` int(11) NOT NULL,
  `monto_a_pagar` decimal(10,0) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado_pago` varchar(45) NOT NULL,
  `id_compra_repuesto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_contable`
--

CREATE TABLE `cuenta_contable` (
  `id_cuenta` int(11) NOT NULL,
  `nombre_cuenta` varchar(50) DEFAULT NULL,
  `tipo_cuenta` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_servicio`
--

CREATE TABLE `detalles_servicio` (
  `id_order` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_repuesto`
--

CREATE TABLE `detalle_repuesto` (
  `id_order` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad_usada` int(11) NOT NULL,
  `precio_unitario_cobrado` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_transaccion`
--

CREATE TABLE `detalle_transaccion` (
  `id_detalle` int(11) NOT NULL,
  `id_transaccion` int(11) NOT NULL,
  `id_cuenta_contable` int(11) NOT NULL,
  `debe` decimal(18,2) NOT NULL,
  `haber` decimal(18,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnostico`
--

CREATE TABLE `diagnostico` (
  `num_diagnostico` int(11) NOT NULL,
  `id_vehiculo` varchar(15) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `descrip_falla` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `usuario` varchar(30) NOT NULL,
  `contrasena` varchar(45) NOT NULL,
  `nombre_emp` varchar(45) NOT NULL,
  `apellido_emp` varchar(45) NOT NULL,
  `cedula_emp` varchar(9) NOT NULL,
  `cargo` varchar(45) NOT NULL,
  `fecha_contratacion` date NOT NULL,
  `sueldo_base` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `usuario`, `contrasena`, `nombre_emp`, `apellido_emp`, `cedula_emp`, `cargo`, `fecha_contratacion`, `sueldo_base`) VALUES
(21, 'yejo', '1234', 'jose', 'rodriguez', '30942261', 'mecanico', '2025-10-10', 45.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `fecha_fact` date NOT NULL,
  `estado_pago` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_order` int(11) NOT NULL,
  `metodo_pago` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gasto`
--

CREATE TABLE `gasto` (
  `id_gasto` int(11) NOT NULL,
  `fecha_gasto` date NOT NULL,
  `monto_gasto` decimal(10,2) NOT NULL,
  `descp_gasto` tinytext NOT NULL,
  `tipo_gasto` varchar(45) NOT NULL,
  `id_cate_gasto` int(11) NOT NULL,
  `metodo_pago` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_de_trabajo`
--

CREATE TABLE `orden_de_trabajo` (
  `id_order` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_estimada` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  `num_diagnostico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_realizado`
--

CREATE TABLE `pago_realizado` (
  `id_pago_realizado` int(11) NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `concepto_pago` varchar(45) NOT NULL,
  `id_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `nombre_fiscal` varchar(45) NOT NULL,
  `rif_juridico` int(15) NOT NULL,
  `telefono_proveedor` varchar(11) NOT NULL,
  `direcion_proveedor` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL,
  `nombre_repuesto` varchar(45) NOT NULL,
  `descp_repuesto` tinytext NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `stock_inventario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(45) NOT NULL,
  `description` tinytext NOT NULL,
  `precio_base` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa_empleado`
--

CREATE TABLE `tarifa_empleado` (
  `id_empleado` int(11) NOT NULL,
  `tarifa_por_hora` decimal(10,2) NOT NULL,
  `id_tarifa_empleado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id_transaccion` int(11) NOT NULL,
  `tipo_asiento` varchar(45) NOT NULL,
  `fecha_asiento` date NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `id_transaccion_pago` int(11) NOT NULL,
  `id_transaccion_cobro` int(11) NOT NULL,
  `id_transaccion_gasto` int(11) NOT NULL,
  `id_pago_emp` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculo`
--

CREATE TABLE `vehiculo` (
  `matricula` varchar(15) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `año` year(4) NOT NULL,
  `color` varchar(20) NOT NULL,
  `marca` varchar(20) NOT NULL,
  `modelo` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD PRIMARY KEY (`id_cate_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `cedula_unique` (`cedula`);

--
-- Indices de la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  ADD PRIMARY KEY (`id_compra_repuesto`),
  ADD KEY `fk_proveedor` (`id_proveedor`),
  ADD KEY `fk_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `concepto_cobro`
--
ALTER TABLE `concepto_cobro`
  ADD PRIMARY KEY (`id_concepto_cuenta_por_cobrar`),
  ADD KEY `fk_factura` (`id_factura`);

--
-- Indices de la tabla `concepto_pago`
--
ALTER TABLE `concepto_pago`
  ADD PRIMARY KEY (`id_concepto_cuenta_por_pagar`),
  ADD KEY `fk_compra_repuesto` (`id_compra_repuesto`);

--
-- Indices de la tabla `cuenta_contable`
--
ALTER TABLE `cuenta_contable`
  ADD PRIMARY KEY (`id_cuenta`);

--
-- Indices de la tabla `detalles_servicio`
--
ALTER TABLE `detalles_servicio`
  ADD PRIMARY KEY (`id_order`,`id_servicio`),
  ADD KEY `id_servicio` (`id_servicio`);

--
-- Indices de la tabla `detalle_repuesto`
--
ALTER TABLE `detalle_repuesto`
  ADD PRIMARY KEY (`id_order`,`id_repuesto`),
  ADD KEY `id_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_transacciones` (`id_transaccion`),
  ADD KEY `fk_cuenta_contable` (`id_cuenta_contable`);

--
-- Indices de la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`num_diagnostico`),
  ADD KEY `idx_id_vehiculo` (`id_vehiculo`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD KEY `idx_id_empleado` (`id_empleado`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `idx_id_cliente` (`id_cliente`),
  ADD KEY `idx_id_order` (`id_order`);

--
-- Indices de la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

--
-- Indices de la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  ADD PRIMARY KEY (`id_order`),
  ADD KEY `idx_num_diagnostico` (`num_diagnostico`);

--
-- Indices de la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  ADD PRIMARY KEY (`id_pago_realizado`),
  ADD KEY `idx_id_empleado` (`id_empleado`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `nombre_fiscal` (`nombre_fiscal`),
  ADD UNIQUE KEY `rif_juridico` (`rif_juridico`);

--
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`id_repuesto`),
  ADD KEY `idx_id_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`id_servicio`),
  ADD KEY `idx_id_servicio` (`id_servicio`);

--
-- Indices de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `id_tarifa_empleado` (`id_tarifa_empleado`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id_transaccion`),
  ADD KEY `fk_concepto_pago` (`id_transaccion_pago`),
  ADD KEY `fk_concepto_cobro` (`id_transaccion_cobro`),
  ADD KEY `fk_pago_realizado` (`id_pago_emp`),
  ADD KEY `fk_gasto` (`id_transaccion_gasto`);

--
-- Indices de la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD PRIMARY KEY (`matricula`),
  ADD KEY `idx_id_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  MODIFY `id_compra_repuesto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  MODIFY `id_order` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  MODIFY `id_pago_realizado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  MODIFY `id_tarifa_empleado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id_transaccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  ADD CONSTRAINT `fk_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  ADD CONSTRAINT `fk_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `concepto_cobro`
--
ALTER TABLE `concepto_cobro`
  ADD CONSTRAINT `fk_factura` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`);

--
-- Filtros para la tabla `concepto_pago`
--
ALTER TABLE `concepto_pago`
  ADD CONSTRAINT `fk_compra_repuesto` FOREIGN KEY (`id_compra_repuesto`) REFERENCES `compra_repuesto` (`id_compra_repuesto`);

--
-- Filtros para la tabla `detalles_servicio`
--
ALTER TABLE `detalles_servicio`
  ADD CONSTRAINT `detalles_servicio_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`),
  ADD CONSTRAINT `detalles_servicio_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicio` (`id_servicio`);

--
-- Filtros para la tabla `detalle_repuesto`
--
ALTER TABLE `detalle_repuesto`
  ADD CONSTRAINT `detalle_repuesto_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`),
  ADD CONSTRAINT `detalle_repuesto_ibfk_2` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  ADD CONSTRAINT `fk_cuenta_contable` FOREIGN KEY (`id_cuenta_contable`) REFERENCES `cuenta_contable` (`id_cuenta`),
  ADD CONSTRAINT `fk_transacciones` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones` (`id_transaccion`);

--
-- Filtros para la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD CONSTRAINT `diagnostico_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`matricula`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`);

--
-- Filtros para la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `gasto_ibfk_1` FOREIGN KEY (`id_cate_gasto`) REFERENCES `categoria_gasto` (`id_cate_gasto`);

--
-- Filtros para la tabla `orden_de_trabajo`
--
ALTER TABLE `orden_de_trabajo`
  ADD CONSTRAINT `orden_de_trabajo_ibfk_1` FOREIGN KEY (`num_diagnostico`) REFERENCES `diagnostico` (`num_diagnostico`);

--
-- Filtros para la tabla `pago_realizado`
--
ALTER TABLE `pago_realizado`
  ADD CONSTRAINT `pago_realizado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

--
-- Filtros para la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD CONSTRAINT `tarifa_empleado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

--
-- Filtros para la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD CONSTRAINT `fk_concepto_cobro` FOREIGN KEY (`id_transaccion_cobro`) REFERENCES `concepto_cobro` (`id_concepto_cuenta_por_cobrar`),
  ADD CONSTRAINT `fk_concepto_pago` FOREIGN KEY (`id_transaccion_pago`) REFERENCES `concepto_pago` (`id_concepto_cuenta_por_pagar`),
  ADD CONSTRAINT `fk_gasto` FOREIGN KEY (`id_transaccion_gasto`) REFERENCES `gasto` (`id_gasto`),
  ADD CONSTRAINT `fk_pago_realizado` FOREIGN KEY (`id_pago_emp`) REFERENCES `pago_realizado` (`id_pago_realizado`);

--
-- Filtros para la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD CONSTRAINT `vehiculo_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
