--
-- caligarum
-- database initialization script
--

--
-- handle metadata used when applying patch
--

CREATE TABLE `metadata` (
  `name` varchar(255) NOT NULL PRIMARY KEY,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO metadata SET name='schema-patch-level', value='1';

CREATE TABLE `auth_api_key` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `api_key` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`)
) ENGINE=InnoDB;

CREATE TABLE `auth_user_type` (
  `id` int(1) unsigned NOT NULL,
  `type` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

INSERT INTO `auth_user_type` VALUES (0, 'ADMIN'), (1, 'USER');

CREATE TABLE `auth_user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_id` int(1) unsigned DEFAULT 1,
  `hash` varchar(32) NOT NULL,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `password` varchar(60) NOT NULL,
  `recovery` varchar(32) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status_id` int(10) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`),
  UNIQUE KEY `email` (`email`),
  FOREIGN KEY `fk_user_type` (`type_id`) REFERENCES `auth_user_type`(`id`)
) ENGINE=InnoDB;
