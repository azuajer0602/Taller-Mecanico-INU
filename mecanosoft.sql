-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-12-2025 a las 07:38:41
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
-- Estructura de tabla para la tabla `atributos`
--

CREATE TABLE `atributos` (
  `id_atributo` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `atributos`
--

INSERT INTO `atributos` (`id_atributo`, `nombre`) VALUES
(1, 'Nivel de Aceite de Motor'),
(2, 'Fugas de Motor (Aceite/Refrigerante)'),
(3, 'Estado de Correas y Bandas'),
(4, 'Mangueras y Abrazaderas'),
(5, 'Filtro de Aire'),
(6, 'Soportes de Motor'),
(7, 'Pastillas de Freno Delanteras'),
(8, 'Pastillas de Freno Traseras'),
(9, 'Discos / Tambores de Freno'),
(10, 'Nivel Líquido de Frenos'),
(11, 'Freno de Mano'),
(12, 'Amortiguadores Delanteros'),
(13, 'Amortiguadores Traseros'),
(14, 'Estado de Neumáticos (Cauchos)'),
(15, 'Terminales de Dirección'),
(16, 'Bujes de Suspensión'),
(17, 'Alineación del Vehículo'),
(18, 'Estado de Batería'),
(19, 'Alternador (Carga)'),
(20, 'Luces Exteriores (Faros/Stop)'),
(21, 'Testigos de Tablero (Check Engine)'),
(22, 'Aire Acondicionado'),
(23, 'Estado del Embrague (Clutch)'),
(24, 'Guardapolvos y Tripoides'),
(25, 'Nivel Aceite de Caja/Transmisión'),
(26, 'Nivel de Refrigerante (Coolant)'),
(27, 'Nivel Aceite Dirección Hidráulica'),
(28, 'Escobillas Limpiaparabrisas'),
(29, 'Sensor de Cinturones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `atributo_vehiculo`
--

CREATE TABLE `atributo_vehiculo` (
  `id_atributo_vehiculo` int(11) NOT NULL,
  `matricula` varchar(15) NOT NULL,
  `id_atributo` int(11) NOT NULL,
  `id_estado_atributo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `atributo_vehiculo`
--

INSERT INTO `atributo_vehiculo` (`id_atributo_vehiculo`, `matricula`, `id_atributo`, `id_estado_atributo`) VALUES
(30, 'AFGRGS6', 1, 1),
(31, 'AFGRGS6', 2, 1),
(32, 'AFGRGS6', 3, 1),
(33, 'AFGRGS6', 4, 1),
(34, 'AFGRGS6', 5, 1),
(35, 'AFGRGS6', 6, 1),
(36, 'AFGRGS6', 7, 1),
(37, 'AFGRGS6', 8, 1),
(38, 'AFGRGS6', 9, 1),
(39, 'AFGRGS6', 10, 1),
(40, 'AFGRGS6', 11, 1),
(41, 'AFGRGS6', 12, 1),
(42, 'AFGRGS6', 13, 1),
(43, 'AFGRGS6', 14, 1),
(44, 'AFGRGS6', 15, 1),
(45, 'AFGRGS6', 16, 1),
(46, 'AFGRGS6', 17, 1),
(47, 'AFGRGS6', 18, 1),
(48, 'AFGRGS6', 19, 1),
(49, 'AFGRGS6', 20, 1),
(50, 'AFGRGS6', 21, 1),
(51, 'AFGRGS6', 22, 1),
(52, 'AFGRGS6', 23, 1),
(53, 'AFGRGS6', 24, 1),
(54, 'AFGRGS6', 25, 1),
(55, 'AFGRGS6', 26, 1),
(56, 'AFGRGS6', 27, 1),
(57, 'AFGRGS6', 28, 1),
(58, 'AFGRGS6', 29, 1);

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
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `Estado` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`cedula`, `nombre`, `apellido`, `id_cliente`, `correo`, `direccion`, `telefono`, `Estado`) VALUES
('10636307', 'Maria', 'Romero', 3, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('106363010', 'Maria', 'Romerotee', 4, 'mariamilagro@gmail.coms', 'La Miel', '0424528464', 0),
('10446307', 'Maria', 'Romero', 6, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('10444407', 'Maria', 'Romero', 7, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('10475865', 'Maria', 'Romera', 9, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('104745565', 'Maria', 'Romera', 10, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('147522565', 'Maria', 'Romera', 11, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('14733565', 'Maria', 'Romera', 12, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 1),
('15866565', 'Maria', 'Romera', 13, 'mariamilagro@gmail.coms', 'La Miel', '042452844864', 0),
('21586987', 'Jose', 'Perez', 16, 'josesitoperez@gmail.com', 'La Mielci', '04160196347', 1),
('30942261', 'Yelians', 'Rodriguez', 17, 'yeliansrodriguez@gmail.com', 'km 13 via buena vista sector sol y sombra', '04120971137', 1),
('30694319', 'Jose', 'Santeliz', 18, 'josesanteliz@gmail.com', 'cabudare Urb las lomas casa 12', '04123189829', 1),
('14877242', 'Yennys', 'Vargas', 19, 'yennysvargas@gmail.com', 'villa productiva la verde casa 25', '04120406974', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra_repuesto`
--

CREATE TABLE `compra_repuesto` (
  `id_compra_repuesto` int(11) NOT NULL,
  `precio_unitario_compra` decimal(10,0) NOT NULL,
  `fecha_compra` datetime NOT NULL,
  `cantidad_comprada` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compra_repuesto`
--

INSERT INTO `compra_repuesto` (`id_compra_repuesto`, `precio_unitario_compra`, `fecha_compra`, `cantidad_comprada`, `id_proveedor`, `id_repuesto`) VALUES
(1, 200, '2025-12-09 00:00:00', 10, 1, 14),
(3, 300, '2025-12-09 00:00:00', 10, 1, 14),
(4, 150, '2025-12-09 00:00:00', 10, 1, 16),
(5, 130, '2025-12-09 00:00:00', 6, 1, 16),
(7, 200, '2025-12-09 00:00:00', 10, 1, 14),
(8, 2500, '2025-12-09 00:00:00', 10, 1, 1558214),
(9, 2500, '2025-12-10 00:00:00', 10, 454, 1558214);

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
  `debe` decimal(18,2) NOT NULL DEFAULT 0.00,
  `haber` decimal(18,2) NOT NULL DEFAULT 0.00,
  `descripcion_detalle` varchar(200) DEFAULT NULL,
  `es_cuenta_por_pagar` tinyint(1) NOT NULL DEFAULT 0,
  `es_cuenta_por_cobrar` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_vencimiento` date DEFAULT NULL,
  `Tipo_de_pago` varchar(40) NOT NULL,
  `id_tipo_transaccion_fk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_transaccion`
--

INSERT INTO `detalle_transaccion` (`id_detalle`, `id_transaccion`, `debe`, `haber`, `descripcion_detalle`, `es_cuenta_por_pagar`, `es_cuenta_por_cobrar`, `fecha_vencimiento`, `Tipo_de_pago`, `id_tipo_transaccion_fk`) VALUES
(96, 53, 500000.00, 0.00, 'Herramientas de mecanica  (Bolívares)', 0, 0, NULL, 'Bolívares', 20),
(97, 53, 0.00, 500000.00, 'Capital social en acciones', 0, 0, NULL, 'Bolívares', 20),
(98, 54, 5000000.00, 0.00, 'Aporte de socios  (Bolívares)', 0, 0, NULL, 'Bolívares', 20),
(99, 54, 0.00, 5000000.00, 'Capital social en acciones', 0, 0, NULL, 'Bolívares', 20),
(100, 55, 100000.00, 0.00, 'Venta de mercancia a Saldivia Motors (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 22),
(101, 55, 0.00, 100000.00, 'Venta de mercancía', 0, 0, NULL, 'Pago Móvil', 22),
(102, 56, 20000.00, 0.00, 'Servicios profesionales', 0, 0, NULL, 'Pago Móvil', 29),
(103, 56, 0.00, 20000.00, 'Gasto en comunnity manager (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 29),
(104, 57, 50000.00, 0.00, 'Venta de mercancia a Motors del este C.A (Bolívares)', 0, 0, NULL, 'Bolívares', 22),
(105, 57, 0.00, 50000.00, 'Venta de mercancía', 0, 0, NULL, 'Bolívares', 22),
(106, 58, 50.00, 0.00, 'Efectivo en bancos', 0, 0, NULL, 'Bolívares', 3),
(107, 58, 0.00, 50.00, 'Deposito de efectivo (Bolívares)', 0, 0, NULL, 'Bolívares', 3),
(108, 59, 5000.00, 0.00, 'Cuentas por pagar', 0, 0, '2025-12-15', 'Bolívares', 18),
(109, 59, 0.00, 5000.00, 'Pago de administradora mes de julio (Bolívares)', 0, 0, NULL, 'Bolívares', 18),
(110, 60, 15350.00, 0.00, 'Cuentas por Cobrar a Clientes', 0, 0, '2025-12-30', 'Pago Móvil', 37),
(111, 60, 0.00, 15350.00, 'Reparacion de vehiculo A cliente Juan Perez  (Pago Móvil)', 0, 0, NULL, 'Pago Móvil', 37),
(112, 61, 2000.00, 0.00, 'Mercancías', 0, 0, NULL, 'Bolívares', 5),
(113, 61, 0.00, 2000.00, 'Compra de amortiguadores (Bolívares)', 0, 0, NULL, 'Bolívares', 5),
(114, 62, 7000000.00, 0.00, 'aporte de socios (Bolívares)', 0, 0, NULL, 'Bolívares', 20),
(115, 62, 0.00, 7000000.00, 'Capital social en acciones', 0, 0, NULL, 'Bolívares', 20),
(116, 63, 2000.00, 0.00, 'Mercancías', 0, 0, NULL, 'Bolívares', 5),
(117, 63, 0.00, 2000.00, 'Compra de amortiguadores (Bolívares)', 0, 0, NULL, 'Bolívares', 5),
(118, 64, 3000.00, 0.00, 'Mercancías', 0, 0, NULL, 'Bolívares', 5),
(119, 64, 0.00, 3000.00, 'Compra de amortiguadores (Bolívares)', 0, 0, NULL, 'Bolívares', 5),
(120, 65, 1500.00, 0.00, 'Mercancías', 0, 0, NULL, 'Bolívares', 5),
(121, 65, 0.00, 1500.00, 'Compra de bujias (Bolívares)', 0, 0, NULL, 'Bolívares', 5),
(122, 66, 780.00, 0.00, 'Compras', 0, 0, NULL, 'Bolívares', 25),
(123, 66, 0.00, 780.00, 'Compra de bujia (Bolívares)', 0, 0, NULL, 'Bolívares', 25),
(124, 67, 2000.00, 0.00, 'Compras', 0, 0, NULL, 'Bolívares', 25),
(125, 67, 0.00, 2000.00, 'Compra de bujia (Bolívares)', 0, 0, NULL, 'Bolívares', 25),
(126, 68, 2000.00, 0.00, 'Compras', 0, 0, NULL, 'Bolívares', 25),
(127, 68, 0.00, 2000.00, 'Compra de amortiguador (Bolívares)', 0, 0, NULL, 'Bolívares', 25),
(128, 69, 25000.00, 0.00, 'Compras', 0, 0, NULL, 'Bolívares', 25),
(129, 69, 0.00, 25000.00, 'Compra de Rin 24 (Bolívares)', 0, 0, NULL, 'Bolívares', 25),
(130, 70, 25000.00, 0.00, 'Compras', 0, 0, NULL, 'Bolívares', 25),
(131, 70, 0.00, 25000.00, 'Compra de Rin 24 (Bolívares)', 0, 0, NULL, 'Bolívares', 25),
(132, 72, 7850.00, 0.00, 'Ingreso Caja (Divisas)', 0, 0, NULL, 'Divisas', 2),
(133, 72, 0.00, 7700.00, 'Ingreso por Venta de Repuestos', 0, 0, NULL, 'N/A', 22),
(134, 72, 0.00, 150.00, 'Ingreso por Servicios Mecánicos', 0, 0, NULL, 'N/A', 23),
(135, 73, 1000.00, 0.00, 'Ingreso Caja (Bolivares en efectivo)', 0, 0, NULL, 'Bolivares en efectivo', 2),
(136, 73, 0.00, 1000.00, 'Ingreso por Venta de Repuestos', 0, 0, NULL, 'N/A', 22),
(137, 74, 2080.00, 0.00, 'Ingreso Caja (Bolivares en efectivo)', 0, 0, NULL, 'Bolivares en efectivo', 2),
(138, 74, 0.00, 2080.00, 'Ingreso por Venta de Repuestos', 0, 0, NULL, 'N/A', 22);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnostico`
--

CREATE TABLE `diagnostico` (
  `num_diagnostico` int(11) NOT NULL,
  `id_vehiculo` varchar(15) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `descrip_falla` text NOT NULL,
  `id_falla` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre_emp` varchar(255) NOT NULL,
  `apellido_emp` varchar(255) NOT NULL,
  `cedula_emp` varchar(255) NOT NULL,
  `cargo` varchar(255) NOT NULL,
  `fecha_contratacion` datetime NOT NULL,
  `sueldo_base` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `usuario`, `contrasena`, `nombre_emp`, `apellido_emp`, `cedula_emp`, `cargo`, `fecha_contratacion`, `sueldo_base`) VALUES
(31, 'rei', '1234', 'reimil', 'azuaje', '31663399', 'Administrador', '2025-11-20 00:00:00', 5000),
(32, 'yejo', '1234', 'Yelians', 'Rodriguez', '30942261', 'Mecanico', '2025-12-09 00:00:00', 40),
(33, 'jose', '30942261', 'Antonio', 'Rodriguez', '7424430', 'Mecanico', '2025-12-11 00:00:00', 1500),
(34, 'juan', '14877242', 'Juan', 'Valdez', '29737640', 'Mecanico', '2025-12-11 00:00:00', 2000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `id_estado` int(11) NOT NULL,
  `nombre_estado` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id_estado`, `nombre_estado`) VALUES
(1, 'En Espera'),
(2, 'En Reparación'),
(3, 'Reparado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_atributo`
--

CREATE TABLE `estados_atributo` (
  `id_estado_atributo_fk` int(11) NOT NULL,
  `nombre_atributo` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_atributo`
--

INSERT INTO `estados_atributo` (`id_estado_atributo_fk`, `nombre_atributo`) VALUES
(1, 'Bueno'),
(2, 'Malo'),
(3, 'No Aplica');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `fecha_fact` date NOT NULL,
  `estado_pago` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `metodo_pago` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `ClienteId` int(11) NOT NULL,
  `fechaPago` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Pendiente',
  `metodoPago` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `ClienteId`, `fechaPago`, `total`, `estado`, `metodoPago`, `createdAt`, `updatedAt`) VALUES
(3, 3, '2025-12-11 00:00:00', 7850.00, 'Pagado', 'Divisas', '2025-12-11 05:24:24', '2025-12-11 05:24:24'),
(4, 9, '2025-12-11 00:00:00', 1000.00, 'Pagado', 'Bolivares en efectivo', '2025-12-11 05:27:00', '2025-12-11 05:27:00'),
(5, 3, '2025-12-11 00:00:00', 2080.00, 'Pagado', 'Bolivares en efectivo', '2025-12-11 05:28:02', '2025-12-11 05:28:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fallas`
--

CREATE TABLE `fallas` (
  `id_falla` int(11) NOT NULL,
  `nombre_falla` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fallas`
--

INSERT INTO `fallas` (`id_falla`, `nombre_falla`) VALUES
(20, 'Aire Acondicionado no Enfría'),
(15, 'Alternador no Manda Carga'),
(8, 'Amortiguadores Explotados/Vencidos'),
(14, 'Batería Defectuosa'),
(9, 'Bujes de Meseta Partidos'),
(21, 'Bujía Rota'),
(5, 'Bujías Desgastadas/Empastadas'),
(16, 'Correa de Tiempo (Distribución) Vencida'),
(4, 'Cuerpo de Aceleración Sucio'),
(19, 'Discos de Freno Ovalados'),
(11, 'Electroventilador Defectuoso'),
(3, 'Filtro de Gasolina Obstruido'),
(17, 'Fuga de Aceite de Motor'),
(12, 'Fuga en Envase de Refrigerante'),
(2, 'Inyectores Sucios/Tapados'),
(7, 'Muñones (Rótulas) Dañados'),
(18, 'Pastillas de Freno Cristalizadas/Gastadas'),
(1, 'Pila de Gasolina (Baja Presión)'),
(6, 'Terminales de Dirección con Juego'),
(13, 'Termostato Pegado'),
(10, 'Tripoides (Juntas Homocinéticas) Sonando');

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
-- Estructura de tabla para la tabla `itemfacturas`
--

CREATE TABLE `itemfacturas` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `FacturaId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `itemfacturas`
--

INSERT INTO `itemfacturas` (`id`, `descripcion`, `cantidad`, `precio`, `createdAt`, `updatedAt`, `FacturaId`) VALUES
(6, 'Servicio Mecánico - Pila de Gasolina (Baja Presión) (AFGRGS6)', 1, 150.00, '2025-12-11 05:24:24', '2025-12-11 05:24:24', 3),
(7, 'Rin 24', 3, 2500.00, '2025-12-11 05:24:24', '2025-12-11 05:24:24', 3),
(8, 'amortiguador', 1, 200.00, '2025-12-11 05:24:24', '2025-12-11 05:24:24', 3),
(9, 'amortiguador', 5, 200.00, '2025-12-11 05:27:00', '2025-12-11 05:27:00', 4),
(10, 'bujia', 16, 130.00, '2025-12-11 05:28:02', '2025-12-11 05:28:02', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `id_marca` int(11) NOT NULL,
  `nombre_marca` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` (`id_marca`, `nombre_marca`) VALUES
(4, 'Chevrolet'),
(2, 'Ford'),
(3, 'JAC'),
(1, 'Toyota'),
(5, 'Volkswagen');

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
  `nombre_fiscal` varchar(255) NOT NULL,
  `rif_juridico` int(11) NOT NULL,
  `telefono_proveedor` varchar(255) NOT NULL,
  `direccion_proveedor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `nombre_fiscal`, `rif_juridico`, `telefono_proveedor`, `direccion_proveedor`) VALUES
(1, 'Chevrolete', 14877242, '04120971138', 'barquisimeto'),
(14, 'Jose\'S Motors', 34004804, '04121756524', 'Via quibor km 13 frente a pescaito'),
(454, 'Perez solutions', 31584789, '04268596325', 'Este de barquisimeto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL,
  `nombre_repuesto` varchar(255) NOT NULL,
  `precio_unitario` decimal(10,0) DEFAULT NULL,
  `stock_inventario` int(11) DEFAULT NULL,
  `desc_repuesto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` (`id_repuesto`, `nombre_repuesto`, `precio_unitario`, `stock_inventario`, `desc_repuesto`) VALUES
(14, 'amortiguador', 200, 38, 'pieza para amotiguacion'),
(16, 'bujia', 130, 0, 'grado 2'),
(1558214, 'Rin 24', 2500, 17, 'Rin para medida 24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id_servicio` int(11) NOT NULL,
  `matricula_fk` varchar(15) NOT NULL,
  `id_empleado_fk` int(11) DEFAULT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `id_falla_reportada` int(11) NOT NULL,
  `entrega` enum('Entregado','No entregado') DEFAULT 'No entregado',
  `fecha_entrada` date DEFAULT NULL,
  `fecha_salida` date DEFAULT NULL,
  `mano_obra` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicio`
--

INSERT INTO `servicio` (`id_servicio`, `matricula_fk`, `id_empleado_fk`, `id_estado`, `id_falla_reportada`, `entrega`, `fecha_entrada`, `fecha_salida`, `mano_obra`) VALUES
(2, 'AFGRGS6', 32, 3, 1, 'Entregado', '2025-12-10', '2025-12-11', 150);

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
-- Estructura de tabla para la tabla `tipo_transaccion`
--

CREATE TABLE `tipo_transaccion` (
  `id_tipo_transaccion_pk` int(11) NOT NULL,
  `nombre_tipo` varchar(100) NOT NULL,
  `codigo_tipo_transaccion` varchar(40) NOT NULL,
  `tipo_cuenta` enum('ACTIVO','PASIVO','CAPITAL','INGRESO','GASTO') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_transaccion`
--

INSERT INTO `tipo_transaccion` (`id_tipo_transaccion_pk`, `nombre_tipo`, `codigo_tipo_transaccion`, `tipo_cuenta`) VALUES
(2, 'Efectivo en caja', '1.1.10.10', 'ACTIVO'),
(3, 'Efectivo en bancos', '1.1.10.20', 'ACTIVO'),
(4, 'Inversiones negociables', '1.1.10.30', 'ACTIVO'),
(5, 'Mercancías', '1.1.30.10', 'ACTIVO'),
(6, 'Materia prima', '1.1.30.20', 'ACTIVO'),
(7, 'Materiales e insumos', '1.1.30.21', 'ACTIVO'),
(8, 'Subproductos, residuos y recuperados', '1.1.30.24', 'ACTIVO'),
(9, 'Impuesto al valor agregado', '1.1.40.20', 'ACTIVO'),
(10, 'Seguros pagados por anticipado', '1.1.50.20', 'ACTIVO'),
(11, 'Arrendamientos pagados por anticipado', '1.1.50.30', 'ACTIVO'),
(12, 'Maquinarias y equipos', '1.2.71.30', 'ACTIVO'),
(13, 'Equipos de transporte', '1.2.71.40', 'ACTIVO'),
(14, 'Equipos de computación', '1.2.71.50', 'ACTIVO'),
(15, 'Mobiliario y equipos de oficina', '1.2.71.60', 'ACTIVO'),
(16, 'Sobregiros', '2.1.10.10', 'PASIVO'),
(17, 'Pagarés', '2.1.10.20', 'PASIVO'),
(18, 'Cuentas por pagar', '2.1.20.20', 'PASIVO'),
(19, 'Impuesto al valor agregado', '2.1.40.20', 'PASIVO'),
(20, 'Capital social en acciones', '3.1.10.10', 'CAPITAL'),
(21, 'Resultados del período', '3.2.20.20', 'CAPITAL'),
(22, 'Venta de mercancía', '4.1.10.10', 'INGRESO'),
(23, 'Servicios profesionales', '4.1.20.10', 'INGRESO'),
(24, 'Variación de inventario', '5.2.20', 'INGRESO'),
(25, 'Compras', '5.2.30', 'GASTO'),
(26, 'Personal de ventas', '6.1.20.10', 'GASTO'),
(27, 'Bienes y suministros', '6.1.20.20', 'GASTO'),
(28, 'Servicios NO profesionales', '6.1.20.30', 'GASTO'),
(29, 'Servicios profesionales', '6.1.20.31', 'GASTO'),
(30, 'Depreciación', '6.1.20.60', 'GASTO'),
(31, 'Personal administrativo', '6.1.30.10', 'GASTO'),
(32, 'Bienes y suministros administrativos', '6.1.30.20', 'GASTO'),
(33, 'Servicios NO profesionales administrativos', '6.1.30.30', 'GASTO'),
(34, 'Servicios profesionales administrativos', '6.1.30.31', 'GASTO'),
(35, 'Depreciación administrativa', '6.1.30.60', 'GASTO'),
(36, 'Gastos por intereses', '6.2.10.10', 'GASTO'),
(37, 'Cuentas por Cobrar a Clientes', '1.1.20.10', 'ACTIVO'),
(38, 'Efectos por Cobrar', '1.1.20.20', 'ACTIVO'),
(39, 'Deudores Diversos', '1.1.20.30', 'ACTIVO'),
(40, 'Cuentas por Pagar a Proveedores', '2.1.20.10', 'PASIVO'),
(41, 'Letras por Pagar', '2.1.20.30', 'PASIVO'),
(42, 'Acreedores Diversos', '2.1.20.40', 'PASIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id_transaccion` int(11) NOT NULL,
  `id_tipo_transaccion_fk` int(45) NOT NULL,
  `fecha_asiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transacciones`
--

INSERT INTO `transacciones` (`id_transaccion`, `id_tipo_transaccion_fk`, `fecha_asiento`) VALUES
(53, 20, '2025-09-01'),
(54, 20, '2025-12-08'),
(55, 22, '2025-12-08'),
(56, 29, '2025-12-08'),
(57, 22, '2025-12-08'),
(58, 3, '2025-12-08'),
(59, 18, '2025-12-08'),
(60, 37, '2025-12-08'),
(61, 5, '2025-12-09'),
(62, 20, '2025-12-09'),
(63, 5, '2025-12-09'),
(64, 5, '2025-12-09'),
(65, 5, '2025-12-09'),
(66, 25, '2025-12-09'),
(67, 25, '2025-12-09'),
(68, 25, '2025-12-09'),
(69, 25, '2025-12-09'),
(70, 25, '2025-12-10'),
(72, 22, '2025-12-11'),
(73, 22, '2025-12-11'),
(74, 22, '2025-12-11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculo`
--

CREATE TABLE `vehiculo` (
  `matricula` varchar(15) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `afio` int(11) DEFAULT NULL,
  `marca` int(20) DEFAULT NULL,
  `diagnosticado` tinyint(4) DEFAULT 0,
  `activo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculo`
--

INSERT INTO `vehiculo` (`matricula`, `id_cliente`, `color`, `modelo`, `afio`, `marca`, `diagnosticado`, `activo`) VALUES
('AFGRGS6', 3, 'Dorado', 'Fiesta', 2025, 2, 1, 1),
('AXIOS', 19, 'Azul', 'Yaris', 2022, 1, 0, 1),
('FEGTE56', 3, 'Gris', 'Carrier', 2025, 3, 0, 1),
('MU5T4NG', 18, 'Rojo', 'Mustang', 2023, 2, 0, 1),
('TH3B00S', 17, 'negro', 'Ford Expedition', 2025, 2, 0, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `atributos`
--
ALTER TABLE `atributos`
  ADD PRIMARY KEY (`id_atributo`);

--
-- Indices de la tabla `atributo_vehiculo`
--
ALTER TABLE `atributo_vehiculo`
  ADD PRIMARY KEY (`id_atributo_vehiculo`),
  ADD KEY `matricula` (`matricula`),
  ADD KEY `id_atributo` (`id_atributo`),
  ADD KEY `id_estado_atributo` (`id_estado_atributo`);

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
  ADD KEY `tipo_transaccion_fk` (`id_tipo_transaccion_fk`);

--
-- Indices de la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`num_diagnostico`),
  ADD KEY `idx_id_vehiculo` (`id_vehiculo`),
  ADD KEY `id_falla` (`id_falla`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`id_estado`);

--
-- Indices de la tabla `estados_atributo`
--
ALTER TABLE `estados_atributo`
  ADD PRIMARY KEY (`id_estado_atributo_fk`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `idx_id_cliente` (`id_cliente`),
  ADD KEY `idx_id_order` (`id_servicio`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ClienteId` (`ClienteId`);

--
-- Indices de la tabla `fallas`
--
ALTER TABLE `fallas`
  ADD PRIMARY KEY (`id_falla`),
  ADD UNIQUE KEY `nombre_falla` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_2` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_3` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_4` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_5` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_6` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_7` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_8` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_9` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_10` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_11` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_12` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_13` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_14` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_15` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_16` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_17` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_18` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_19` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_20` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_21` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_22` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_23` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_24` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_25` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_26` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_27` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_28` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_29` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_30` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_31` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_32` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_33` (`nombre_falla`),
  ADD UNIQUE KEY `nombre_falla_34` (`nombre_falla`);

--
-- Indices de la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `idx_id_cate_gasto` (`id_cate_gasto`);

--
-- Indices de la tabla `itemfacturas`
--
ALTER TABLE `itemfacturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FacturaId` (`FacturaId`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`id_marca`),
  ADD UNIQUE KEY `nombre_marca` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_2` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_3` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_4` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_5` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_6` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_7` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_8` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_9` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_10` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_11` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_12` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_13` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_14` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_15` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_16` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_17` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_18` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_19` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_20` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_21` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_22` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_23` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_24` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_25` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_26` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_27` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_28` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_29` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_30` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_31` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_32` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_33` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_34` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_35` (`nombre_marca`),
  ADD UNIQUE KEY `nombre_marca_36` (`nombre_marca`);

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
  ADD UNIQUE KEY `rif_juridico` (`rif_juridico`),
  ADD UNIQUE KEY `nombre_fiscal_7` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_8` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_9` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_14` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_16` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_24` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_41` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_47` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_49` (`nombre_fiscal`),
  ADD UNIQUE KEY `nombre_fiscal_57` (`nombre_fiscal`);

--
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`id_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_2` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_3` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_4` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_5` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_6` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_7` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_8` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_9` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_10` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_11` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_12` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_13` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_14` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_15` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_16` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_17` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_18` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_19` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_20` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_21` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_22` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_23` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_24` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_25` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_26` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_27` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_28` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_29` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_30` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_31` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_32` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_33` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_34` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_35` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_36` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_37` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_38` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_39` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_40` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_41` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_42` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_43` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_44` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_45` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_46` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_47` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_48` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_49` (`nombre_repuesto`),
  ADD UNIQUE KEY `nombre_repuesto_50` (`nombre_repuesto`),
  ADD KEY `idx_id_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`id_servicio`),
  ADD KEY `idx_id_servicio` (`id_servicio`),
  ADD KEY `matricula_fk` (`matricula_fk`),
  ADD KEY `id_empleado_fk` (`id_empleado_fk`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `falla_reportada` (`id_falla_reportada`);

--
-- Indices de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `id_tarifa_empleado` (`id_tarifa_empleado`);

--
-- Indices de la tabla `tipo_transaccion`
--
ALTER TABLE `tipo_transaccion`
  ADD PRIMARY KEY (`id_tipo_transaccion_pk`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id_transaccion`),
  ADD KEY `id_tipo_transaccion_fk` (`id_tipo_transaccion_fk`);

--
-- Indices de la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD PRIMARY KEY (`matricula`),
  ADD KEY `idx_id_cliente` (`id_cliente`),
  ADD KEY `marca` (`marca`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `atributos`
--
ALTER TABLE `atributos`
  MODIFY `id_atributo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `atributo_vehiculo`
--
ALTER TABLE `atributo_vehiculo`
  MODIFY `id_atributo_vehiculo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  MODIFY `id_compra_repuesto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `fallas`
--
ALTER TABLE `fallas`
  MODIFY `id_falla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `itemfacturas`
--
ALTER TABLE `itemfacturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  MODIFY `id_tarifa_empleado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_transaccion`
--
ALTER TABLE `tipo_transaccion`
  MODIFY `id_tipo_transaccion_pk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id_transaccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `atributo_vehiculo`
--
ALTER TABLE `atributo_vehiculo`
  ADD CONSTRAINT `atributo_vehiculo_ibfk_64` FOREIGN KEY (`matricula`) REFERENCES `vehiculo` (`matricula`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `atributo_vehiculo_ibfk_65` FOREIGN KEY (`id_atributo`) REFERENCES `atributos` (`id_atributo`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_atributo_estado` FOREIGN KEY (`id_estado_atributo`) REFERENCES `estados_atributo` (`id_estado_atributo_fk`);

--
-- Filtros para la tabla `compra_repuesto`
--
ALTER TABLE `compra_repuesto`
  ADD CONSTRAINT `compra_repuesto_ibfk_72` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `compra_repuesto_ibfk_73` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`) ON DELETE NO ACTION ON UPDATE CASCADE;

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
-- Filtros para la tabla `detalle_repuesto`
--
ALTER TABLE `detalle_repuesto`
  ADD CONSTRAINT `detalle_repuesto_ibfk_1` FOREIGN KEY (`id_order`) REFERENCES `orden_de_trabajo` (`id_order`),
  ADD CONSTRAINT `detalle_repuesto_ibfk_2` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `detalle_transaccion`
--
ALTER TABLE `detalle_transaccion`
  ADD CONSTRAINT `detalle_transaccion_ibfk_2` FOREIGN KEY (`id_tipo_transaccion_fk`) REFERENCES `tipo_transaccion` (`id_tipo_transaccion_pk`),
  ADD CONSTRAINT `detalle_transaccion_ibfk_3` FOREIGN KEY (`id_transaccion`) REFERENCES `transacciones` (`id_transaccion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD CONSTRAINT `diagnostico_ibfk_65` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`matricula`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `diagnostico_ibfk_66` FOREIGN KEY (`id_falla`) REFERENCES `fallas` (`id_falla`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`ClienteId`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `gasto_ibfk_1` FOREIGN KEY (`id_cate_gasto`) REFERENCES `categoria_gasto` (`id_cate_gasto`);

--
-- Filtros para la tabla `itemfacturas`
--
ALTER TABLE `itemfacturas`
  ADD CONSTRAINT `ItemFacturas_FacturaId_foreign_idx` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_1` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_10` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_11` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_12` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_13` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_14` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_15` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_16` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_17` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_18` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_19` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_2` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_20` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_21` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_22` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_23` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_24` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_25` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_26` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_27` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_28` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_29` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_3` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_30` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_31` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_32` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_33` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_34` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_35` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_36` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_37` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_38` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_4` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_5` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_6` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_7` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_8` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `itemfacturas_ibfk_9` FOREIGN KEY (`FacturaId`) REFERENCES `facturas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Filtros para la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD CONSTRAINT `servicio_ibfk_4` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  ADD CONSTRAINT `servicio_ibfk_93` FOREIGN KEY (`matricula_fk`) REFERENCES `vehiculo` (`matricula`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `servicio_ibfk_94` FOREIGN KEY (`id_empleado_fk`) REFERENCES `empleado` (`id_empleado`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `servicio_ibfk_95` FOREIGN KEY (`id_falla_reportada`) REFERENCES `fallas` (`id_falla`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `tarifa_empleado`
--
ALTER TABLE `tarifa_empleado`
  ADD CONSTRAINT `tarifa_empleado_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`);

--
-- Filtros para la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`id_tipo_transaccion_fk`) REFERENCES `tipo_transaccion` (`id_tipo_transaccion_pk`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD CONSTRAINT `vehiculo_ibfk_73` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `vehiculo_ibfk_74` FOREIGN KEY (`marca`) REFERENCES `marca` (`id_marca`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
