CREATE TABLE `admin_menu` (
  `id` varchar(100) NOT NULL COMMENT 'ID',
  `name` varchar(50) NOT NULL COMMENT '이름',
  `depth` int NOT NULL COMMENT 'Depth',
  `parent_id` varchar(100) DEFAULT NULL COMMENT '상위 메뉴 ID',
  `uri` varchar(100) DEFAULT NULL COMMENT 'URI',
  `is_super_admin_menu` tinyint(1) NOT NULL DEFAULT '0' COMMENT '슈퍼 관리자 사용 가능 메뉴 여부',
  `is_all_user_menu` tinyint(1) NOT NULL DEFAULT '0' COMMENT '모든 관리자 사용 가능 메뉴 여부',
  `icon` varchar(50) DEFAULT NULL COMMENT '아이콘 (fontawesome)',
  `seq` int NOT NULL COMMENT '동일 Depth에서 노출 순서',
  PRIMARY KEY (`id`),
  KEY `uid_d_s_id` (`depth`,`seq`,`id`)
) ENGINE=InnoDB COMMENT='메뉴';

CREATE TABLE `admin_group` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(50) NOT NULL COMMENT '이름',
  `is_lock` tinyint(1) NOT NULL DEFAULT '0' COMMENT '제한 여부',
  `is_privacy_access` tinyint(1) NOT NULL DEFAULT '0' COMMENT '개인정보 접근 여부',
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_name_unique` (`name`)
) ENGINE=InnoDB COMMENT='그룹';

CREATE TABLE `admin_user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(50) NOT NULL COMMENT '이름',
  `email` varchar(50) NOT NULL COMMENT '이메일',
  `password` varchar(255) NOT NULL COMMENT '비밀번호',
  `tel` varchar(20) NOT NULL COMMENT '전화번호',
  `must_password_change` tinyint(1) NOT NULL DEFAULT '1' COMMENT '로그인 시 비밀번호 강제 변경 여부',
  `is_lock` tinyint(1) NOT NULL DEFAULT '0' COMMENT '사용제한 여부',
  `login_fail_count` int NOT NULL DEFAULT '0' COMMENT '로그인 실패 횟수',
  `remember_token` varchar(100) DEFAULT NULL COMMENT 'Remember Token',
  `create_date` datetime NOT NULL COMMENT '등록 일자',
  `update_date` datetime NOT NULL COMMENT '수정 일자',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_unique` (`email`),
  KEY `user_name_id_index` (`name`,`id`),
  KEY `user_tel_id_index` (`tel`,`id`),
  KEY `user_create_date_id_index` (`create_date`,`id`)
) ENGINE=InnoDB COMMENT='관리자';

CREATE TABLE `admin_group_menu` (
  `admin_group_id` int unsigned NOT NULL COMMENT '그룹 ID (admin_group 테이블)',
  `admin_menu_id` varchar(50) NOT NULL DEFAULT '' COMMENT '메뉴 ID (admin_menu 테이블)',
  `read` tinyint(1) NOT NULL DEFAULT '0' COMMENT '읽기 권한 여부',
  `write` tinyint(1) NOT NULL DEFAULT '0' COMMENT '쓰기 권한 여부',
  `export` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'EXPORT 권한 여부',
  PRIMARY KEY (`admin_group_id`,`admin_menu_id`)
) ENGINE=InnoDB COMMENT='그룹의 메뉴별 사용 권한';

CREATE TABLE `admin_group_user` (
  `admin_group_id` int unsigned NOT NULL COMMENT '그룹 ID (admin_group 테이블)',
  `admin_user_id` int unsigned NOT NULL COMMENT '관리자 ID (admin_user 테이블)',
  PRIMARY KEY (`admin_group_id`,`admin_user_id`),
  UNIQUE KEY `group_user_user_id_unique` (`admin_user_id`),
  KEY `uid_uid_gid` (`admin_user_id`,`admin_group_id`)
) ENGINE=InnoDB COMMENT='그룹별 관리자';

CREATE TABLE `admin_user_access_key` (
  `id` varchar(200) NOT NULL COMMENT 'ID',
  `type` enum('VIEW','EXPORT') NOT NULL COMMENT '구분',
  `title` varchar(100) NOT NULL COMMENT '이름',
  PRIMARY KEY (`id`),
  KEY `idx_type_id` (`type`,`id`)
) ENGINE=InnoDB COMMENT='관리자 접근 로그 키';

CREATE TABLE `admin_user_access_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `admin_user_id` int unsigned NOT NULL COMMENT '관리자 ID',
  `admin_user_access_key_id` varchar(200) NOT NULL COMMENT '관리자 접근 로그 키 ID',
  `url` varchar(255) NOT NULL COMMENT 'URL',
  `create_date` datetime NOT NULL COMMENT '등록 일자',
  PRIMARY KEY (`id`),
  KEY `idx_user_access_key_id_create_date` (`admin_user_access_key_id`,`create_date`),
  KEY `idx_user_id_user_access_key_id_create_date` (`admin_user_id`,`admin_user_access_key_id`,`create_date`),
  KEY `idx_user_id_create_date` (`admin_user_id`,`create_date`)
) ENGINE=InnoDB;

CREATE TABLE `admin_user_activity_type` (
  `id` int unsigned NOT NULL COMMENT '관리자 활동 구분 ID',
  `name` varchar(50) NOT NULL COMMENT '관리자 활동 구분 이름',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_activity_type_name_unique` (`name`)
) ENGINE=InnoDB COMMENT='관리자 활동 구분';

CREATE TABLE `admin_user_activity` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '관리자 활동 ID',
  `admin_user_activity_type_id` int unsigned NOT NULL COMMENT '사용자 활동 구분 ID (admin_user_activity_type 테이블)',
  `parent_id` varchar(50) DEFAULT NULL COMMENT '활동 대상 테이블의 ID',
  `admin_user_id` int unsigned NOT NULL COMMENT '활동 관리자 ID (admin_user 테이블)',
  `activity_text_1` text COMMENT '활동 내용 1',
  `activity_text_2` text COMMENT '활동 내용 2',
  `memo` text COMMENT '메모',
  `create_date` datetime NOT NULL COMMENT '등록 일자',
  `update_date` datetime NOT NULL COMMENT '수정 일자',
  PRIMARY KEY (`id`),
  KEY `uid_uatid_pid_id` (`admin_user_activity_type_id`,`parent_id`,`id`),
  KEY `uid_uatid_id` (`admin_user_activity_type_id`,`id`),
  KEY `uid_uid_id` (`admin_user_id`,`id`)
) ENGINE=InnoDB COMMENT='관리자 활동';

CREATE TABLE `admin_user_login_log` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '관리자 로그인 로그 ID',
  `admin_user_id` int NOT NULL COMMENT '관리자 ID (admin_user 테이블)',
  `ip_address` varchar(20) NOT NULL COMMENT 'IP 주소',
  `ip_country` varchar(50) NOT NULL COMMENT 'IP 국가',
  `ip_city` varchar(50) NOT NULL COMMENT 'IP 도시',
  `create_date` datetime NOT NULL COMMENT '생성 일자',
  PRIMARY KEY (`id`),
  KEY `user_login_log_create_date_id_index` (`create_date`,`id`),
  KEY `user_login_log_user_id_id_index` (`admin_user_id`,`id`),
  KEY `user_login_log_ip_address_id_index` (`ip_address`,`id`),
  KEY `user_login_log_ip_country_id_index` (`ip_country`,`id`),
  KEY `user_login_log_ip_city_id_index` (`ip_city`,`id`),
  KEY `user_login_log_admin_user_id_create_date_index` (`admin_user_id`,`create_date`)
) ENGINE=InnoDB COMMENT='관리자 로그인 로그';

CREATE TABLE `admin_privacy_access_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '개인정보 접근 로그 ID',
  `admin_user_id` int unsigned NOT NULL COMMENT '관리자 ID (admin_user 테이블)',
  `type` varchar(50) NOT NULL COMMENT '구분',
  `reason` varchar(100) NOT NULL COMMENT '조회사유',
  `parent_id` bigint NOT NULL COMMENT '참조 테이블 ID',
  `create_date` datetime NOT NULL COMMENT '생성 일자',
  PRIMARY KEY (`id`),
  KEY `idx_auid_cd` (`admin_user_id`,`create_date`),
  KEY `idx_t_cd` (`type`,`create_date`),
  KEY `idx_t_auid_cd` (`type`,`admin_user_id`,`create_date`),
  KEY `idx_cd` (`create_date`),
  KEY `idx_auid_id` (`admin_user_id`,`id`),
  KEY `idx_t_id` (`type`,`id`),
  KEY `idx_t_auid_id` (`type`,`admin_user_id`,`id`)
) ENGINE=InnoDB COMMENT='개인정보 접근 로그';

INSERT INTO `admin_group` (`id`, `name`, `is_lock`, `is_privacy_access`)
VALUES
	(1, 'Super Admin', 0, 0);

INSERT INTO `admin_user` (`id`, `name`, `email`, `password`, `tel`, `must_password_change`, `is_lock`, `login_fail_count`, `remember_token`, `create_date`, `update_date`)
VALUES
	(101, '슈퍼어드민', 'super@admin.com', '$2b$10$faEXhY5zrc30uNHCmYHtne9cvCX9H6HIjPixICByXhNpJOt/wSUIK', '010-0000-0000', 1, 0, 0, '', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

INSERT INTO `admin_group_user` (`admin_group_id`, `admin_user_id`)
VALUES
	(1, 101);

INSERT INTO `admin_menu` (`id`, `name`, `depth`, `parent_id`, `uri`, `is_super_admin_menu`, `is_all_user_menu`, `icon`, `seq`)
VALUES
	('admin', '어드민 관리', 1, NULL, NULL, 0, 0, 'gear', 100),
	('admin/menu', '메뉴 관리', 2, 'admin', '/admin/menu', 1, 0, NULL, 1),
	('admin/user', '사용자 관리', 2, 'admin', '/admin/user', 1, 0, NULL, 20),
	('admin/group', '그룹 관리', 2, 'admin', '/admin/group', 1, 0, NULL, 30),
	('admin/login_log', '로그인 로그', 2, 'admin', '/admin/login_log', 0, 1, NULL, 40),
	('admin/password', '비밀번호 수정', 2, 'admin', '/admin/password', 0, 1, NULL, 50),
	('admin/access_stat', '접근 통계', 2, 'admin', '/admin/access_stat', 1, 0, NULL, 60);
	('admin/privacy_access_log', '개인정보 조회 로그', 2, 'admin', '/admin/privacy_access_log', 1, 0, NULL, 70);

INSERT INTO `admin_user_access_key` (`id`, `type`, `title`)
VALUES
	('dashboard', 'VIEW', '대시보드'),
	('admin/menu', 'VIEW', '어드민 관리 > 메뉴 관리'),
	('admin/access_stat', 'VIEW', '어드민 관리 > 접근 통계'),
	('admin/privacy_access_log', 'VIEW', '어드민 관리 > 개인정보 접근 로그'),
	('admin/group', 'VIEW', '어드민 관리 > 그룹 관리'),
	('admin/group/:id', 'VIEW', '어드민 관리 > 그룹 관리 > 상세'),
	('admin/login_log', 'VIEW', '어드민 관리 > 로그인 로그'),
	('admin/password', 'VIEW', '어드민 관리 > 비밀번호 수정'),
	('admin/user', 'VIEW', '어드민 관리 > 사용자 관리'),
	('export/admin/login_log', 'EXPORT', '어드민 관리 > 로그인 로그'),
	('export/admin/user_access_log', 'EXPORT', '어드민 관리 > 접근 통계'),
	('export/admin/user', 'EXPORT', '어드민 관리 > 사용자 관리');
	('export/admin/privacy_access_log', 'EXPORT', '어드민 관리 > 개인정보 조회 로그');
