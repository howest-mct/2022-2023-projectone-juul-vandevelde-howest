CREATE DATABASE  IF NOT EXISTS `deliverease` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `deliverease`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: deliverease
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  PRIMARY KEY (`action_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action`
--

LOCK TABLES `action` WRITE;
/*!40000 ALTER TABLE `action` DISABLE KEYS */;
INSERT INTO `action` VALUES (1,'deurtje open'),(2,'deurtje toe'),(3,'brief geleverd'),(4,'lege brievenbus'),(5,'pakketje geleverd'),(6,'verlichting gaat aan'),(7,'verlichting gaat uit'),(8,'deurtje geopend'),(9,'pakketjeslade geopend');
/*!40000 ALTER TABLE `action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `device_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `type` tinyint NOT NULL,
  `unit` varchar(15) DEFAULT NULL,
  `discription` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES (1,'ldr',0,'%','lichtsensor'),(2,'rfid',0,NULL,'nfc scanner'),(3,'lm36',0,'°C','temperatuur sensor'),(4,'breakbeam1',0,NULL,'pakketjes sensor'),(5,'breakbeam2',0,NULL,'brieven sensor'),(6,'reed1',0,NULL,'deur sensor'),(7,'reed2',0,NULL,'pakketjeslade sensor'),(8,'lcd',0,NULL,'klein schermpje'),(9,'solenoid',1,NULL,'magnetisch deurslot'),(10,'rgb',1,'hex','huisnr verlichting'),(11,'btn',0,NULL,'afsluit knop');
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `device_id` int NOT NULL,
  `action_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `value` varchar(45) DEFAULT NULL,
  `comment` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `fk_History_Device_idx` (`device_id`),
  KEY `fk_History_Action1_idx` (`action_id`),
  KEY `fk_History_User1_idx` (`user_id`),
  CONSTRAINT `fk_History_Action1` FOREIGN KEY (`action_id`) REFERENCES `action` (`action_id`),
  CONSTRAINT `fk_History_Device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`),
  CONSTRAINT `fk_History_User1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
INSERT INTO `history` VALUES (1,3,5,NULL,'2023-01-05 09:17:42','21.48',NULL),(2,7,1,NULL,'2023-01-12 20:17:47','0',NULL),(3,3,1,NULL,'2023-01-21 08:18:13','12.45','Dit is dummy data'),(4,10,4,NULL,'2023-01-26 05:25:58','#EF3A3A',NULL),(5,4,7,1,'2023-02-03 17:26:40','1',NULL),(6,3,4,NULL,'2023-02-10 14:34:56','26.00',NULL),(7,4,1,NULL,'2023-02-17 02:34:57','1','Dit is dummy data'),(8,6,3,NULL,'2023-02-25 14:35:21','1','Dit is dummy data'),(9,11,8,1,'2023-03-03 11:43:01','1','Dit is dummy data'),(10,6,1,NULL,'2023-03-10 23:43:49','0','Dit is dummy data'),(11,2,8,2,'2023-03-16 20:51:18',NULL,'Dit is dummy data'),(12,9,6,NULL,'2023-03-16 20:51:18','1','Dit is dummy data'),(13,6,1,NULL,'2023-03-23 08:52:08','1','Dit is dummy data'),(14,1,3,NULL,'2023-03-23 08:52:08','100','Dit is dummy data'),(15,9,8,1,'2023-04-01 20:52:30','1','Dit is dummy data'),(16,1,4,NULL,'2023-04-01 20:52:30','78','Dit is dummy data'),(17,10,9,NULL,'2023-04-07 18:00:13','#FECC4D','Dit is dummy data'),(18,4,2,NULL,'2023-04-15 06:00:59','0',NULL),(19,9,8,2,'2023-04-20 03:08:23','0',NULL),(20,2,4,NULL,'2023-04-27 15:09:18',NULL,'Dit is dummy data'),(21,2,9,NULL,'2023-05-07 03:09:38',NULL,NULL),(22,4,4,NULL,'2023-05-13 00:17:26','0',NULL),(23,6,8,2,'2023-05-20 12:18:09','1',NULL),(24,11,1,NULL,'2023-05-25 09:25:37','0',NULL),(25,1,3,NULL,'2023-06-01 21:26:29','94',NULL),(26,8,5,NULL,'2023-06-11 09:26:47',NULL,'Dit is dummy data'),(27,4,1,NULL,'2023-06-17 06:34:38','1','Dit is dummy data'),(28,5,2,NULL,'2023-06-24 18:35:18','1','Dit is dummy data'),(29,10,3,NULL,'2023-06-29 15:42:44','#FFFFFF',NULL),(30,2,2,NULL,'2023-07-07 03:43:39',NULL,'Dit is dummy data'),(31,9,8,1,'2023-07-22 12:51:50','1',NULL),(32,1,5,NULL,'2023-07-30 00:52:28','12',NULL),(33,1,1,NULL,'2023-08-03 22:00:01','23',NULL),(34,5,6,NULL,'2023-08-11 10:00:49','0','Dit is dummy data'),(35,3,4,NULL,'2023-08-26 19:09:02','26.90',NULL),(36,7,3,NULL,'2023-09-03 07:09:37','1','Dit is dummy data'),(37,6,5,NULL,'2023-09-08 04:17:15','0',NULL),(38,3,1,NULL,'2023-09-15 16:18:00','14.30',NULL),(39,11,8,1,'2023-09-30 01:26:13','0','Dit is dummy data'),(40,11,1,NULL,'2023-10-08 13:26:46','0',NULL),(41,1,8,1,'2023-10-13 10:34:28','70',NULL),(42,9,6,NULL,'2023-10-20 22:35:10','1','Dit is dummy data'),(43,1,4,NULL,'2023-11-04 07:43:25','45',NULL),(44,3,6,NULL,'2023-11-12 19:43:55','23.88',NULL),(45,3,2,NULL,'2023-11-17 16:51:32','15.76','Dit is dummy data'),(46,9,9,NULL,'2023-11-25 04:52:20','0',NULL),(47,1,7,1,'2023-12-09 14:00:36','89',NULL),(48,9,7,2,'2023-12-18 02:01:04','0','Dit is dummy data'),(49,7,1,NULL,'2023-12-22 23:08:45','0',NULL),(50,1,9,NULL,'2023-12-30 11:09:30','69','Dit is dummy data');
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint NOT NULL,
  `nfc_tag` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Juul','Van de Velde','juul.van.de.velde@student.howest.be','Juul','testdata*123',1,'testdata*NFC'),(2,'Test','Gebruiker','test.gebruiker@example.com','Test','testdata*123',0,'');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-20 16:39:55
