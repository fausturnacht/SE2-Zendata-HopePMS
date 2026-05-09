-- Hope, Inc. Database 
-- Fictitious Company
-- Conceptualized by JEREMIAS C. ESPERANZA - NEU CCS
-- Information Management Course

-- Create customer table 
CREATE TABLE employee (empno VARCHAR(5) NOT NULL PRIMARY KEY, 
											 lastname VARCHAR(15),  
											 firstname VARCHAR(15), 
											 gender CHAR(1) CONSTRAINT gender_ck CHECK (gender in ('M','F')), 
											 birthdate DATE, 
											 hiredate DATE, 
											 sepDate DATE);

-- Insert employee records
INSERT INTO employee VALUES('00001','Smith', 'John', 'M','1985-02-20','2010-05-11', NULL);
INSERT INTO employee VALUES('00003','Smith', 'Jane', 'F','1990-05-16','2010-05-11', NULL);
INSERT INTO employee VALUES('00005','King', 'Don', 'M','1986-02-14','2010-06-23', NULL);
INSERT INTO employee VALUES('00007','Jenskin', 'Floyd', 'M','1990-02-20','2010-05-30', NULL);
INSERT INTO employee VALUES('00009','Cerudo', 'Bambie', 'F','1983-06-23','2010-05-30', NULL);
INSERT INTO employee VALUES('00011','Davis', 'Tom', 'M','1989-12-16','2010-06-30', NULL);
INSERT INTO employee VALUES('00013','Morris', 'Olive', 'F','1991-07-21','2010-06-30', NULL);
INSERT INTO employee VALUES('00015','Zulueta', 'Maggie', 'F','1990-08-03','2010-07-05', '2011-03-30');
INSERT INTO employee VALUES('00017','Celestino', 'Nelia', 'F','1984-10-24','2010-07-05', NULL);
INSERT INTO employee VALUES('00019','Esperanza', 'Nehemiah', 'M','1982-02-21','2010-07-05', '2014-04-28');
INSERT INTO employee VALUES('00021','Manchester', 'Chelie', 'F','1988-12-07','2010-07-05', NULL);
INSERT INTO employee VALUES('00023','Kline', 'Nicholas', 'M','1992-01-21','2010-07-05', '2010-12-23');
INSERT INTO employee VALUES('00025','Macapagal', 'Ivy', 'F','1992-04-30','2010-07-05', NULL);
INSERT INTO employee VALUES('00027','Blanche', 'Ernest', 'M','1986-12-21','2010-07-05', NULL);
INSERT INTO employee VALUES('00029','Chua', 'Evangeline', 'F','1989-03-10','2010-07-05', NULL);
INSERT INTO employee VALUES('00031','Lancaster', 'Greta', 'F','1987-08-17','2010-07-05', NULL);
INSERT INTO employee VALUES('00033','Parks', 'Nigel', 'M','1993-06-23','2010-07-05', NULL);
INSERT INTO employee VALUES('00035','Carlston', 'Voltaire', 'F','1985-06-12','2010-07-21', NULL);
INSERT INTO employee VALUES('00037','Silva', 'Yves', 'M','1988-09-21','2010-07-21', NULL);
INSERT INTO employee VALUES('00039','Geisert', 'William', 'M','1980-03-03','2010-07-21', NULL);
INSERT INTO employee VALUES('00041','Darwin', 'Helena', 'F','1978-11-08','2010-09-01', NULL);
INSERT INTO employee VALUES('00043','Love', 'Queen', 'F','1983-11-29','2010-09-01', NULL);
INSERT INTO employee VALUES('00045','Raven', 'Danny', 'M','1984-02-15','2010-12-03', NULL);
INSERT INTO employee VALUES('00047','Devito', 'Clint', 'M','1981-06-07','2010-12-03', NULL);
INSERT INTO employee VALUES('00049','Irving', 'Nancy', 'F','1987-09-19','2010-12-03', NULL);
INSERT INTO employee VALUES('00051','Baltimore', 'Fergie', 'F','1986-10-10','2011-01-05', NULL);
INSERT INTO employee VALUES('00053','Jones', 'Veronica', 'F','1983-05-01','2011-01-05', '2011-03-30');
INSERT INTO employee VALUES('00055','Travis', 'Ursula', 'F','1987-06-07','2011-01-05', NULL);
INSERT INTO employee VALUES('00057','Orleans', 'Sylvia', 'F','1987-01-28','2011-01-05', NULL);
INSERT INTO employee VALUES('00059','Sy', 'Alice', 'F','1984-08-13','2011-01-05', '2011-04-20');
INSERT INTO employee VALUES('00061','De Leon', 'Girlie', 'F','1983-07-27','2011-01-05', NULL);
INSERT INTO employee VALUES('00063','Grant', 'Albert', 'M','1979-05-05','2011-01-05', NULL);

-- Create DEPARTMENT
CREATE TABLE department (deptCode VARCHAR(3) NOT NULL,
												 deptName VARCHAR (20), 
												 PRIMARY KEY (deptCode)) ;

INSERT INTO department VALUES('ACT', 'Accounting'),
														 ('BR1', 'Sales Branch 1'),
														 ('BR2', 'Sales Branch 2'),
														 ('EXC', 'Executive'),
														 ('HRD', 'Human Resource'),
														 ('IT', 'Information Tech'),
														 ('PAY', 'Payroll'), 
														 ('WHS', 'Warehouse');

-- Create JOB 
CREATE TABLE job (jobCode VARCHAR(4) NOT NULL PRIMARY KEY, 
									jobDesc VARCHAR(20)) ;

-- Insert rows JOB 
INSERT INTO job VALUES('PRES','President');
INSERT INTO job VALUES('VP','Vice president');
INSERT INTO job VALUES('MGR','Manager');
INSERT INTO job VALUES('SA1','Sales Agent 1');
INSERT INTO job VALUES('SA2','Sales Agent 2');
INSERT INTO job VALUES('SPVR','Supervisor');
INSERT INTO job VALUES('CLK1','Clerk 1');
INSERT INTO job VALUES('CLK2','Clerk 2');
INSERT INTO job VALUES('PR1','Programmer 1');
INSERT INTO job VALUES('PR2','Programmer 2');
INSERT INTO job VALUES('ANYS','Analyst');
INSERT INTO job VALUES('ACCT','Accountant');
INSERT INTO job VALUES('WMAN','Warehouse man');
INSERT INTO job VALUES('HRS','HR Specialist');

-- Create jobHistory
CREATE TABLE jobHistory (empNo VARCHAR(5) NOT NULL REFERENCES employee,
												 jobCode VARCHAR(4) NOT NULL REFERENCES job, 
												 effDate DATE NOT NULL , 
												 salary DECIMAL(10,2) CONSTRAINT salary_ck 
												 CHECK (salary >= 0.0), deptCode VARCHAR(4),
												 PRIMARY KEY (empNo, jobCode,effDate), 
												 FOREIGN KEY (deptCode) REFERENCES department);

-- Insert rows jobHistory
INSERT INTO jobHistory VALUES('00001','PR1', '2010-05-11', 48000,'IT');
INSERT INTO jobHistory VALUES('00001','PR2', '2010-12-01', 50000,'IT');
INSERT INTO jobHistory VALUES('00003','PR2', '2010-05-11', 50000,'IT');
INSERT INTO jobHistory VALUES('00003','ANYS', '2010-12-01', 55000,'IT');
INSERT INTO jobHistory VALUES('00005','SA1', '2010-06-23', 36000,'BR1');
INSERT INTO jobHistory VALUES('00005','SA2', '2011-01-02', 38000,'BR1');
INSERT INTO jobHistory VALUES('00007','ANYS', '2010-05-30', 55000,'IT');
INSERT INTO jobHistory VALUES('00007','MGR', '2011-01-02', 60000,'IT');
INSERT INTO jobHistory VALUES('00007','VP', '2011-03-31', 80000,'IT');
INSERT INTO jobHistory VALUES('00009','ACCT', '2010-05-30', 50000,'ACT');
INSERT INTO jobHistory VALUES('00009','MGR', '2010-12-01', 60000,'ACT');
INSERT INTO jobHistory VALUES('00011','PRES', '2010-06-30', 100000,'EXC');
INSERT INTO jobHistory VALUES('00013','MGR', '2010-06-30', 60000,'BR1');
INSERT INTO jobHistory VALUES('00013','VP', '2011-01-02', 80000,'BR2');
INSERT INTO jobHistory VALUES('00013','VP', '2011-03-01', 80000,'BR1');
INSERT INTO jobHistory VALUES('00015','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00017','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00017','SPVR', '2011-01-12', 40000,'BR1');
INSERT INTO jobHistory VALUES('00019','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00019','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00021','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00021','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00023','MGR', '2010-07-05', 60000,'HRD');
INSERT INTO jobHistory VALUES('00025','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00027','SA1', '2010-07-05', 36000,'BR1');
INSERT INTO jobHistory VALUES('00027','SA2', '2011-01-12', 38000,'BR1');
INSERT INTO jobHistory VALUES('00029','SPVR', '2010-07-05', 40000,'BR1');
INSERT INTO jobHistory VALUES('00029','MGR', '2011-01-02', 60000,'BR1');
INSERT INTO jobHistory VALUES('00031','WMAN', '2010-07-05', 35000,'WHS');
INSERT INTO jobHistory VALUES('00031','WMAN', '2011-12-01', 40000,'WHS');
INSERT INTO jobHistory VALUES('00033','WMAN', '2010-07-05', 35000,'WHS');
INSERT INTO jobHistory VALUES('00035','ACCT', '2010-07-21', 50000,'PAY');
INSERT INTO jobHistory VALUES('00037','CLK1', '2010-07-21', 34000,'PAY');
INSERT INTO jobHistory VALUES('00039','CLK1', '2010-07-21', 34000,'PAY');
INSERT INTO jobHistory VALUES('00039','CLK2', '2012-06-30', 35000,'EXC');
INSERT INTO jobHistory VALUES('00041','SPVR', '2010-09-01', 40000,'WHS');
INSERT INTO jobHistory VALUES('00041','MGR', '2011-06-01', 60000,'WHS');
INSERT INTO jobHistory VALUES('00043','CLK2', '2010-09-01', 35000,'EXC');
INSERT INTO jobHistory VALUES('00043','SPVR', '2011-06-01', 35000,'EXC');
INSERT INTO jobHistory VALUES('00043','SPVR', '2011-01-12', 35000,'HRD');
INSERT INTO jobHistory VALUES('00045','SPVR', '2010-12-03', 40000,'ACT');
INSERT INTO jobHistory VALUES('00047','CLK1', '2010-12-03', 34000,'EXC');
INSERT INTO jobHistory VALUES('00047','CLK2', '2011-01-12', 35000,'HRD');
INSERT INTO jobHistory VALUES('00049','MGR', '2010-12-03', 60000,'BR2');
INSERT INTO jobHistory VALUES('00051','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00053','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00055','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00055','SA2', '2011-03-01', 38000,'BR2');
INSERT INTO jobHistory VALUES('00057','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00057','PR1', '2011-06-01', 48000,'BR2');
INSERT INTO jobHistory VALUES('00059','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00061','SA1', '2011-01-05', 36000,'BR2');
INSERT INTO jobHistory VALUES('00063','SA2', '2011-01-05', 38000,'BR2');
INSERT INTO jobHistory VALUES('00063','SPVR', '2011-06-01', 40000,'BR2');

select * from jobHistory;

-- Create table Customer
CREATE TABLE customer (custno VARCHAR(5) NOT NULL PRIMARY KEY, 
											 custname VARCHAR(20), 
											 address VARCHAR(50), 
											 payterm VARCHAR(3) CONSTRAINT pay_ck 
											 CHECK (payterm IN ('COD', '30D', '45D'))) ;

-- Insert customer records
INSERT INTO customer VALUES('C0001','Globus Medical, Inc', '2560 Gen Armistead Ave Audubon CA 94031', '30D');
INSERT INTO customer VALUES('C0002','RF Industries, Inc', '7610 Miramar Rd San Diego, CA 92602', '45D');
INSERT INTO customer VALUES('C0003','Trisha Macdowell', '7642 Clairemont Mesa Blvd San Diego CA 90321', 'COD');
INSERT INTO customer VALUES('C0004','HMS Holdings, Inc', '1000 So Fremont Ave, Suite 225 Alhambara CA 91303', '45D');
INSERT INTO customer VALUES('C0005','Christian Andersen', '1120 Lincoln St Suite 809 Sacramento CA 95815', 'COD');
INSERT INTO customer VALUES('C0006','Astronics, Inc', '2 Orion Aliso Viejo, CA 92656', '30D');
INSERT INTO customer VALUES('C0007','Morgan Alegore', '2 Goodyear Irvine, CA 92618', 'COD');
INSERT INTO customer VALUES('C0008','Abaxis, Inc', '3240 Whipple Rd, Union City, CA 94587', '30D');
INSERT INTO customer VALUES('C0009','Landec Corp.', '3603 Haven Avenue Menlo Park, CA 94025', '30D');
INSERT INTO customer VALUES('C0010','SMP Corp.', '3718 Northern Long Island NY 12528', '45D');
INSERT INTO customer VALUES('C0011','B&G Foods', '4 Gatehall Dr., Ste. 110 Parsippany, NJ 07054', '45D');
INSERT INTO customer VALUES('C0012','Dexter Santos', '2739 Rebeiro Ave, Santa Clara, CA 95051', 'COD');
INSERT INTO customer VALUES('C0013','Health Stream', '209 10th Ave, South Suite 450 Nashville Tennessee', '45D');
INSERT INTO customer VALUES('C0014','InSync Training LLC', 'P.O. Box 3122 Roanoke, VA 24015', '30D');
INSERT INTO customer VALUES('C0015','Bespoke Education', '8205 Santa Monica Blvd, Suite 365 W HWood CA 90046', '30D');
INSERT INTO customer VALUES('C0016','Peri Solutions', '2880 Zanker Road San Jose CA 95101', '30D');
INSERT INTO customer VALUES('C0017','Janet Lim', '800 N. State College Blvd. Fullerton, CA 92831', 'COD');
INSERT INTO customer VALUES('C0018','Nicole Hutchison', '200 Lincoln Ave, Salinas, CA 93901', 'COD');
INSERT INTO customer VALUES('C0019','Brandon Drucker', '65 West Alisal St., # 101, Salinas, CA 93901', 'COD');
INSERT INTO customer VALUES('C0020','Eugene Whitaker', '45 Fremont Street, Suite 2000 San Frans, CA 9410', 'COD');
INSERT INTO customer VALUES('C0021','Touch Suite', '1081 Holland Dr. Boca Raton, FL 33487', '30D');
INSERT INTO customer VALUES('C0022','CallFire', '1410 2nd St., Suite 200 Santa Monica, CA 90401', '45D');
INSERT INTO customer VALUES('C0023','ISBX Corp', '3415 S. Sepulveda Blvd. 1250 Los Angeles, CA 90034', '30D');
INSERT INTO customer VALUES('C0024','Factual', '1999 Avenue of the Stars Los Angeles, CA 90067 ', '30D');
INSERT INTO customer VALUES('C0025','Predixion', '31910 Del Obispo San Juan Capistrano, CA 92675', '45D');
INSERT INTO customer VALUES('C0026','Datapop', '5762 W Jefferson Blvd, Los Angeles, CA 90016', '45D');
INSERT INTO customer VALUES('C0027','SA Photonics, Inc', '130 Knowles Dr, Los Gatos, CA 95032', '30D');
INSERT INTO customer VALUES('C0028','Acumen Bldg Entp', '7770 Pardee Lane, Ste. 200 Oakland, CA 94621', '30D');
INSERT INTO customer VALUES('C0029','IMCorp', '50 Utopia Road Manchester, CT 06042', '30D');
INSERT INTO customer VALUES('C0030','Brady and Assoc.', '3710 Ruffin Rd, San Diego, CA 90401', '30D');
INSERT INTO customer VALUES('C0031','Yello Hammer LLC', '111 W 28th St, New York, NY 10001', '30D');
INSERT INTO customer VALUES('C0032','Conductor', '2 Park Ave, New York, NY 10016', '30D');
INSERT INTO customer VALUES('C0033','Quantum Networks', '323 West 39th Street 11th Flr NY 10018', '45D');
INSERT INTO customer VALUES('C0034','Refinery29', '225 Broadway NY 10007', '45D');
INSERT INTO customer VALUES('C0035','Gravity Media', '104 W 27th St #11d NY 10001', '30D');
INSERT INTO customer VALUES('C0036','Regal wings', '244 Fifth Avenue, Suite 200 New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0037','33Across', '229 W 28th St, New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0038','RCS Capital', '405 Park Avenue New York, NY 1002', '30D');
INSERT INTO customer VALUES('C0039','OnDeck', '1400 Broadway, 25th Floor, New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0040','Optimatic Media, Inc', '54 West 40th St., 7th Floor, New York, NY 10018', '30D');
INSERT INTO customer VALUES('C0041','James Underwood', '450 West 33rd Street New York, NY 10018', 'COD');
INSERT INTO customer VALUES('C0042','Charles Silverstone', '1335 Ave of the Americas, New York, NY 10019', 'COD');
INSERT INTO customer VALUES('C0043','Nea Sanchez', '371 7th Ave, New York, NY 10001', 'COD');
INSERT INTO customer VALUES('C0044','Tracy Lambert', '234 W 42nd St, New York, NY 10036', 'COD');
INSERT INTO customer VALUES('C0045','Peter Charlestone', '342 W 40th St, New York, NY 10018', 'COD');
INSERT INTO customer VALUES('C0046','Oxford Academy', '5172 Orange Ave, Cypress, CA 90630', '45D');
INSERT INTO customer VALUES('C0047','Whitney High Sch', '16800 Shoemaker Ave, Cerritos, CA 90703', '30D');
INSERT INTO customer VALUES('C0048','Pacfic Collegiate', '255 Swift St, Santa Cruz, CA 95060', '45D');
INSERT INTO customer VALUES('C0049','KIPP San Jose', '1790 Educational Park Dr, San Jose, CA 95133', '30D');
INSERT INTO customer VALUES('C0050','The Preuss School', '9500 Gilman Dr Mc 0536, La Jolla, CA 92093', '45D');
INSERT INTO customer VALUES('C0051','American Indian Sch', '3637 Magee Ave, Oakland, CA 94619', '30D');
INSERT INTO customer VALUES('C0052','Lowell High School', '1101 Eucalyptus Dr, San Francisco, CA 94132', '45D');
INSERT INTO customer VALUES('C0053','University HSchool', '2611 East Matoian M/S Uh134, Fresno, CA 93740', '30D');
INSERT INTO customer VALUES('C0054','Hawthorne Academy', '4467 West Broadway, Hawthorne, CA 90250', '30D');
INSERT INTO customer VALUES('C0055','Lennox Academy', '11036 Hawthorne Blvd, Lennox, CA 90304', '45D');
INSERT INTO customer VALUES('C0056','Manhasset School', '200 Memorial Place Manhasset, NY 11030', '45D');
INSERT INTO customer VALUES('C0057','Pittsford High Sch', '55 Sutherland St Pittsford, NY 14534', '30D');
INSERT INTO customer VALUES('C0058','Jericho High School', '99 Cedar Swamp Rd, Jericho, NY 11753', '45D');
INSERT INTO customer VALUES('C0059','Stuyvesant High', '345 Chambers St, New York, NY 10282', '45D');
INSERT INTO customer VALUES('C0060','Rye High School', 'Parsons St, Rye, NY 10580', '30D');
INSERT INTO customer VALUES('C0061','Brooklyn High', '29 Ft Greene Place, Brooklyn, NY 11217', '45D');
INSERT INTO customer VALUES('C0062','Brooklyn Latin Sch', '325 Bushwick Ave, Brooklyn, NY 11206', '30D');
INSERT INTO customer VALUES('C0063','Bronx Science High', '75 West 205Th St Bronx, NY 10468', '45D');
INSERT INTO customer VALUES('C0064','Staten Island High', '485 Clawson St, Staten Island, NY 10306', '30D');
INSERT INTO customer VALUES('C0065','Yonkers Middle High', '150 Rockland Ave, Yonkers, NY 10705', '45D');
INSERT INTO customer VALUES('C0066','Helen Strong', '800 S Main StTulelake, CA 96134', 'COD');
INSERT INTO customer VALUES('C0067','Gay Rose Silva', '575 3rd St Napa, CA 94559', 'COD');
INSERT INTO customer VALUES('C0068','William Pichler', '1121 L St #407 Sacramento, CA 95814', 'COD');
INSERT INTO customer VALUES('C0069','Terrance Nitz', '23200 Pacific Coast Hwy Malibu, CA 90265', 'COD');
INSERT INTO customer VALUES('C0070','Errol Atanacio', '300 Capitol Mall #555 Sacramento, CA 95814', 'COD');
INSERT INTO customer VALUES('C0071','Chuck Jones', '163 W 125th St New York, NY 10027', 'COD');
INSERT INTO customer VALUES('C0072','Menchu Palmores', '600 College Ave Montour Falls, NY 14865', 'COD');
INSERT INTO customer VALUES('C0073','Princess Ann White', '109 S Union St #411 Rochester, NY 14607', 'COD');
INSERT INTO customer VALUES('C0074','Florence Black', '450 S Salina St Syracuse, NY 13202', 'COD');
INSERT INTO customer VALUES('C0075','Jeremy Irons', '3357 US Highway 9w Highland, NY 12528', 'COD');
INSERT INTO customer VALUES('C0076','Braddy Banks', '1424 Fulton St Brooklyn, NY 11216', 'COD');
INSERT INTO customer VALUES('C0077','Office NY Tech Serv', 'State Capitol Empire State Plaza NY 10027', '45D');
INSERT INTO customer VALUES('C0078','FDA New York', '158-15 Liberty Ave., Jamaica, NY 12528', '45D');
INSERT INTO customer VALUES('C0079','Social Sec Admn NY', '123 William St, New York, NY 10038', '45D');
INSERT INTO customer VALUES('C0080','Social Sec Admn CA', '3836 Wilshire Blvd, Los Angeles, CA 90010', '45D');
INSERT INTO customer VALUES('C0081','Dept Food and Agri', '220 N Street Sacramento, CA 95814', '45D');
INSERT INTO customer VALUES('C0082','California Dept Tech', '1325 J St Suite 1600 Sacramento CA 95814', '45D');

-- Create sales
CREATE TABLE  sales (transNo VARCHAR(8) NOT NULL PRIMARY KEY, 
										 salesDate DATE, 
										 custNo VARCHAR(5), 
										 empNo VARCHAR(5), 	
										 FOREIGN KEY (custNo) REFERENCES customer, 
										 FOREIGN KEY (empno) REFERENCES employee);

-- Insert rows sales
INSERT INTO sales VALUES('TR000001','2010-06-27', 'C0001', '00005');
INSERT INTO sales VALUES('TR000002','2010-07-05', 'C0003', '00005');
INSERT INTO sales VALUES('TR000003','2010-07-05', 'C0002', '00015');
INSERT INTO sales VALUES('TR000004','2010-07-07', 'C0004', '00017');
INSERT INTO sales VALUES('TR000005','2010-07-09', 'C0005', '00019');
INSERT INTO sales VALUES('TR000006','2010-07-07', 'C0001', '00005');
INSERT INTO sales VALUES('TR000007','2010-07-07', 'C0002', '00015');
INSERT INTO sales VALUES('TR000008','2010-07-10', 'C0006', '00021');
INSERT INTO sales VALUES('TR000009','2010-07-10', 'C0007', '00021');
INSERT INTO sales VALUES('TR000010','2010-07-10', 'C0008', '00021');
INSERT INTO sales VALUES('TR000011','2010-07-10', 'C0009', '00005');
INSERT INTO sales VALUES('TR000012','2010-07-12', 'C0004', '00017');
INSERT INTO sales VALUES('TR000013','2010-07-12', 'C0010', '00025');
INSERT INTO sales VALUES('TR000014','2010-07-12', 'C0011', '00021');
INSERT INTO sales VALUES('TR000015','2010-07-12', 'C0012', '00025');
INSERT INTO sales VALUES('TR000016','2010-07-12', 'C0013', '00027');
INSERT INTO sales VALUES('TR000017','2010-07-12', 'C0001', '00005');
INSERT INTO sales VALUES('TR000018','2010-07-13', 'C0006', '00021');
INSERT INTO sales VALUES('TR000019','2010-08-01', 'C0014', '00019');
INSERT INTO sales VALUES('TR000020','2010-08-05', 'C0007', '00021');
INSERT INTO sales VALUES('TR000021','2010-08-05', 'C0015', '00027');
INSERT INTO sales VALUES('TR000022','2010-08-10', 'C0016', '00021');
INSERT INTO sales VALUES('TR000023','2010-08-10', 'C0017', '00027');
INSERT INTO sales VALUES('TR000024','2010-08-10', 'C0018', '00027');
INSERT INTO sales VALUES('TR000025','2010-08-10', 'C0019', '00025');
INSERT INTO sales VALUES('TR000026','2010-08-12', 'C0011', '00021');
INSERT INTO sales VALUES('TR000027','2010-08-30', 'C0009', '00005');
INSERT INTO sales VALUES('TR000028','2010-08-30', 'C0008', '00021');
INSERT INTO sales VALUES('TR000029','2010-09-05', 'C0002', '00015');
INSERT INTO sales VALUES('TR000030','2010-09-05', 'C0010', '00025');
INSERT INTO sales VALUES('TR000031','2010-09-05', 'C0005', '00019');
INSERT INTO sales VALUES('TR000032','2010-09-05', 'C0014', '00019');
INSERT INTO sales VALUES('TR000033','2010-09-06', 'C0012', '00025');
INSERT INTO sales VALUES('TR000034','2010-09-06', 'C0018', '00027');
INSERT INTO sales VALUES('TR000035','2010-09-10', 'C0021', '00027');
INSERT INTO sales VALUES('TR000036','2010-09-10', 'C0022', '00019');
INSERT INTO sales VALUES('TR000037','2010-09-23', 'C0023', '00021');
INSERT INTO sales VALUES('TR000038','2010-09-23', 'C0024', '00005');
INSERT INTO sales VALUES('TR000039','2010-09-23', 'C0025', '00015');
INSERT INTO sales VALUES('TR000040','2010-10-05', 'C0021', '00019');
INSERT INTO sales VALUES('TR000041','2010-10-05', 'C0023', '00025');
INSERT INTO sales VALUES('TR000042','2020-10-25', 'C0026', '00005');
INSERT INTO sales VALUES('TR000043','2010-10-27', 'C0027', '00019');
INSERT INTO sales VALUES('TR000044','2010-11-09', 'C0028', '00027');
INSERT INTO sales VALUES('TR000045','2010-11-10', 'C0029', '00027');
INSERT INTO sales VALUES('TR000046','2010-11-20', 'C0030', '00019');
INSERT INTO sales VALUES('TR000047','2010-11-20', 'C0023', '00025');
INSERT INTO sales VALUES('TR000048','2010-12-05', 'C0026', '00005');
INSERT INTO sales VALUES('TR000049','2010-12-10', 'C0007', '00021');
INSERT INTO sales VALUES('TR000050','2010-12-10', 'C0003', '00005');
INSERT INTO sales VALUES('TR000051','2010-12-10', 'C0011', '00021');
INSERT INTO sales VALUES('TR000052','2011-01-10', 'C0031', '00051');
INSERT INTO sales VALUES('TR000053','2011-01-10', 'C0032', '00051');
INSERT INTO sales VALUES('TR000054','2011-01-10', 'C0033', '00051');
INSERT INTO sales VALUES('TR000055','2011-01-10', 'C0034', '00053');
INSERT INTO sales VALUES('TR000056','2011-01-10', 'C0035', '00055');
INSERT INTO sales VALUES('TR000057','2011-01-10', 'C0036', '00055');
INSERT INTO sales VALUES('TR000058','2011-01-10', 'C0029', '00027');
INSERT INTO sales VALUES('TR000059','2011-01-10', 'C0022', '00019');
INSERT INTO sales VALUES('TR000060','2011-01-10', 'C0026', '00005');
INSERT INTO sales VALUES('TR000061','2011-01-10', 'C0027', '00027');
INSERT INTO sales VALUES('TR000062','2011-01-10', 'C0013', '00027');
INSERT INTO sales VALUES('TR000063','2011-01-10', 'C0016', '00021');
INSERT INTO sales VALUES('TR000064','2011-01-17', 'C0037', '00057');
INSERT INTO sales VALUES('TR000065','2011-01-17', 'C0038', '00059');
INSERT INTO sales VALUES('TR000066','2011-01-17', 'C0039', '00061');
INSERT INTO sales VALUES('TR000067','2011-01-17', 'C0040', '00063');
INSERT INTO sales VALUES('TR000068','2011-01-20', 'C0041', '00059');
INSERT INTO sales VALUES('TR000069','2011-01-20', 'C0042', '00059');
INSERT INTO sales VALUES('TR000070','2011-01-25', 'C0043', '00059');
INSERT INTO sales VALUES('TR000071','2011-01-25', 'C0044', '00059');
INSERT INTO sales VALUES('TR000072','2011-01-25', 'C0045', '00059');
INSERT INTO sales VALUES('TR000073','2011-02-01', 'C0046', '00021');
INSERT INTO sales VALUES('TR000074','2011-02-01', 'C0047', '00005');
INSERT INTO sales VALUES('TR000075','2011-02-01', 'C0048', '00017');
INSERT INTO sales VALUES('TR000076','2011-02-02', 'C0045', '00059');
INSERT INTO sales VALUES('TR000077','2011-02-02', 'C0044', '00059');
INSERT INTO sales VALUES('TR000078','2011-02-07', 'C0035', '00055');
INSERT INTO sales VALUES('TR000079','2011-02-07', 'C0036', '00055');
INSERT INTO sales VALUES('TR000080','2011-02-07', 'C0040', '00063');
INSERT INTO sales VALUES('TR000081','2011-02-10', 'C0049', '00025');
INSERT INTO sales VALUES('TR000082','2011-02-10', 'C0050', '00027');
INSERT INTO sales VALUES('TR000083','2011-02-12', 'C0032', '00051');
INSERT INTO sales VALUES('TR000084','2011-02-12', 'C0033', '00051');
INSERT INTO sales VALUES('TR000085','2011-02-15', 'C0051', '00019');
INSERT INTO sales VALUES('TR000086','2011-02-15', 'C0052', '00019');
INSERT INTO sales VALUES('TR000087','2011-02-20', 'C0053', '00025');
INSERT INTO sales VALUES('TR000088','2011-02-20', 'C0054', '00005');
INSERT INTO sales VALUES('TR000089','2011-02-20', 'C0055', '00021');
INSERT INTO sales VALUES('TR000090','2011-03-02', 'C0056', '00051');
INSERT INTO sales VALUES('TR000091','2011-03-02', 'C0057', '00053');
INSERT INTO sales VALUES('TR000092','2011-03-02', 'C0058', '00053');
INSERT INTO sales VALUES('TR000093','2011-03-02', 'C0059', '00055');
INSERT INTO sales VALUES('TR000094','2011-03-02', 'C0060', '00051');
INSERT INTO sales VALUES('TR000095','2011-03-05', 'C0050', '00027');
INSERT INTO sales VALUES('TR000096','2011-03-05', 'C0051', '00019');
INSERT INTO sales VALUES('TR000097','2011-03-05', 'C0052', '00019');
INSERT INTO sales VALUES('TR000098','2011-03-05', 'C0055', '00021');
INSERT INTO sales VALUES('TR000099','2011-03-13', 'C0061', '00057');
INSERT INTO sales VALUES('TR000100','2011-03-13', 'C0062', '00057');
INSERT INTO sales VALUES('TR000101','2011-03-13', 'C0063', '00059');
INSERT INTO sales VALUES('TR000102','2011-03-21', 'C0064', '00063');
INSERT INTO sales VALUES('TR000103','2011-03-21', 'C0065', '00057');
INSERT INTO sales VALUES('TR000104','2011-03-30', 'C0009', '00005');
INSERT INTO sales VALUES('TR000105','2011-03-30', 'C0010', '00025');
INSERT INTO sales VALUES('TR000106','2011-03-30', 'C0022', '00019');
INSERT INTO sales VALUES('TR000107','2011-03-30', 'C0013', '00027');
INSERT INTO sales VALUES('TR000108','2011-04-07', 'C0066', '00025');
INSERT INTO sales VALUES('TR000109','2011-04-07', 'C0067', '00025');
INSERT INTO sales VALUES('TR000110','2011-04-07', 'C0068', '00025');
INSERT INTO sales VALUES('TR000111','2011-04-07', 'C0069', '00025');
INSERT INTO sales VALUES('TR000112','2011-04-07', 'C0070', '00025');
INSERT INTO sales VALUES('TR000113','2011-04-07', 'C0071', '00059');
INSERT INTO sales VALUES('TR000114','2011-04-07', 'C0072', '00059');
INSERT INTO sales VALUES('TR000115','2011-04-07', 'C0073', '00059');
INSERT INTO sales VALUES('TR000116','2011-04-07', 'C0074', '00059');
INSERT INTO sales VALUES('TR000117','2011-04-07', 'C0075', '00059');
INSERT INTO sales VALUES('TR000118','2011-04-07', 'C0076', '00059');
INSERT INTO sales VALUES('TR000119','2011-04-10', 'C0077', '00063');
INSERT INTO sales VALUES('TR000120','2011-04-10', 'C0078', '00055');
INSERT INTO sales VALUES('TR000121','2011-04-12', 'C0079', '00051');
INSERT INTO sales VALUES('TR000122','2011-04-12', 'C0080', '00025');
INSERT INTO sales VALUES('TR000123','2011-04-12', 'C0081', '00019');
INSERT INTO sales VALUES('TR000124','2011-04-15', 'C0082', '00017');

-- Create PRODUCT
CREATE TABLE product (prodCode VARCHAR(6) NOT NULL PRIMARY KEY, 
											description VARCHAR(30), 
											unit VARCHAR(3) CONSTRAINT unit_ck 
											CHECK (unit IN ('pc','ea','mtr','pkg','ltr')));

-- Insert rows PRODUCT
INSERT INTO product VALUES('AD0001','Toshiba Canvio 1 TB', 'ea');
INSERT INTO product VALUES('AD0002','WD Ultra 1TB ', 'ea');
INSERT INTO product VALUES('AD0003','Seagate Bracuda 1TB ', 'ea');
INSERT INTO product VALUES('AD0004','Transcend 1 TB ', 'ea');
INSERT INTO product VALUES('AK0001','HP Pavilion DV6000', 'pc');
INSERT INTO product VALUES('AK0002','Micro Innovations Kb', 'pc');
INSERT INTO product VALUES('AK0003','Steel APEX GAMING KB', 'pc');
INSERT INTO product VALUES('AM0001','MS Wireless Mouse', 'pc');
INSERT INTO product VALUES('AM0002','LOGITECH 910-002696', 'pc');
INSERT INTO product VALUES('AM0003','IMICRO KB-IM8911U', 'pc');
INSERT INTO product VALUES('AM0004','STEEL Rival Mouse', 'pc');
INSERT INTO product VALUES('AM0005','Logitech M500 USB', 'pc');
INSERT INTO product VALUES('AP0001','HDMI Pocket Proj', 'pc');
INSERT INTO product VALUES('AP0002','InFocus IN112 Proj', 'pc');
INSERT INTO product VALUES('AP0003','ViewSonic Projector', 'pc');
INSERT INTO product VALUES('MD0001','ASUS VS228H-P 22-In', 'ea');
INSERT INTO product VALUES('MD0002','ViewSonic VA2446M', 'ea');
INSERT INTO product VALUES('MD0003','Dell UltrShrp U2412M', 'ea');
INSERT INTO product VALUES('MD0004','Acer S231HL BBID 23', 'ea');
INSERT INTO product VALUES('MD0005','Apple Dsplay MC914', 'ea');
INSERT INTO product VALUES('MD0006','Asus VE228H 21.5', 'ea');
INSERT INTO product VALUES('MP0001','Apple iPhone 4 16GB ', 'ea');
INSERT INTO product VALUES('MP0002','Apple iPhone 3G', 'ea');
INSERT INTO product VALUES('MP0003','SAMSUNG GALAXY S4 ', 'ea');
INSERT INTO product VALUES('MP0004','SAMSUNG GALAXY S3', 'ea');
INSERT INTO product VALUES('NB0001','Dell Inspiron Laptop', 'ea');
INSERT INTO product VALUES('NB0002','ASUS Tformer Book', 'ea');
INSERT INTO product VALUES('NB0003','Acer C720 Chrome', 'ea');
INSERT INTO product VALUES('NB0004','HP Chromebook 11', 'ea');
INSERT INTO product VALUES('NB0005','Apple Mac Pro Laptop', 'ea');
INSERT INTO product VALUES('NH0001','NETGEAR ProSAFE 5-Port ', 'pc');
INSERT INTO product VALUES('NH0002','TP-LINK  1000Mbps', 'pc');
INSERT INTO product VALUES('NH0003','Cisco 24-P G Switch ', 'pc');
INSERT INTO product VALUES('NT0001','Apple iPad Retna 16G', 'ea');
INSERT INTO product VALUES('NT0002','Apple iPad 2 MC769LL', 'ea');
INSERT INTO product VALUES('NT0003','Apple iPad Mini ', 'ea');
INSERT INTO product VALUES('NT0004','Samsung Galaxy Tab3 ', 'ea');
INSERT INTO product VALUES('NT0005','Samsung Glaxy Tab32G', 'ea');
INSERT INTO product VALUES('NT0006','DrgonTouch 7B 2Core ', 'ea');
INSERT INTO product VALUES('PA0001','MS Ofc Business 2013', 'ea');
INSERT INTO product VALUES('PA0002','Office Mac Home 2011', 'ea');
INSERT INTO product VALUES('PC0001','CyberpowerPC Gamer', 'ea');
INSERT INTO product VALUES('PC0002','Dell 745 Opti Desk', 'ea');
INSERT INTO product VALUES('PC0003','Dell Inspiron Desk', 'ea');
INSERT INTO product VALUES('PC0004','Dell Inspiron 660', 'ea');
INSERT INTO product VALUES('PF0001','Win7 Pro SP1 64bit ', 'ea');
INSERT INTO product VALUES('PF0002','Win7 Home Pre SP1 64', 'ea');
INSERT INTO product VALUES('PF0003','Mac OS X ver 10.6.3', 'ea');
INSERT INTO product VALUES('PF0004','Windows 8.1 64-Bit ', 'ea');
INSERT INTO product VALUES('PF0005','Windows 8 Pro ', 'ea');
INSERT INTO product VALUES('PF0006','RED HAT Prof Edition', 'ea');
INSERT INTO product VALUES('PR0001','Epson Expression ', 'pc');
INSERT INTO product VALUES('PR0002','Canon PIXMA MX922 ', 'pc');
INSERT INTO product VALUES('PR0003','HP Envy 4500 Wireles', 'pc');
INSERT INTO product VALUES('PS0001','VirServ 12Core 128GB', 'pc');
INSERT INTO product VALUES('PS0002','Ms WinServer 2012', 'pc');
INSERT INTO product VALUES('PS0003','Cisco Virt Hardware', 'pc');										

-- Create salesDETAIL
CREATE TABLE salesDetail (transNo VARCHAR(8) NOT NULL REFERENCES sales, 
													prodCode VARCHAR(6) NOT NULL REFERENCES product, 
													quantity DECIMAL(10,2) CONSTRAINT quantity_ck 
													CHECK (quantity >= 0.0), 
													PRIMARY KEY (transNo, prodCode));
													
-- Insert salesDETAIL rows 
INSERT INTO salesDetail VALUES('TR000001','AK0002', 10);
INSERT INTO salesDetail VALUES('TR000001','AM0003', 10);
INSERT INTO salesDetail VALUES('TR000001','MD0001', 10);
INSERT INTO salesDetail VALUES('TR000001','PC0002', 10);
INSERT INTO salesDetail VALUES('TR000002','NB0001', 5);
INSERT INTO salesDetail VALUES('TR000002','PR0001', 1);
INSERT INTO salesDetail VALUES('TR000003','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000004','AK0003', 6);
INSERT INTO salesDetail VALUES('TR000004','AM0004', 6);
INSERT INTO salesDetail VALUES('TR000004','MD0004', 6);
INSERT INTO salesDetail VALUES('TR000004','NB0002', 4);
INSERT INTO salesDetail VALUES('TR000004','PC0003', 6);
INSERT INTO salesDetail VALUES('TR000004','PR0003', 2);
INSERT INTO salesDetail VALUES('TR000005','AK0003', 1);
INSERT INTO salesDetail VALUES('TR000005','MD0005', 1);
INSERT INTO salesDetail VALUES('TR000006','NB0001', 5);
INSERT INTO salesDetail VALUES('TR000006','PF0005', 5);
INSERT INTO salesDetail VALUES('TR000007','PF0003', 2);
INSERT INTO salesDetail VALUES('TR000008','AP0002', 3);
INSERT INTO salesDetail VALUES('TR000008','MD0002', 2);
INSERT INTO salesDetail VALUES('TR000008','NB0004', 1);
INSERT INTO salesDetail VALUES('TR000009','AM0002', 1);
INSERT INTO salesDetail VALUES('TR000009','MD0003', 1);
INSERT INTO salesDetail VALUES('TR000010','AP0001', 2);
INSERT INTO salesDetail VALUES('TR000010','PA0001', 5);
INSERT INTO salesDetail VALUES('TR000011','AK0003', 3);
INSERT INTO salesDetail VALUES('TR000011','AM0004', 3);
INSERT INTO salesDetail VALUES('TR000011','MD0003', 3);
INSERT INTO salesDetail VALUES('TR000011','PC0004', 3);
INSERT INTO salesDetail VALUES('TR000011','PR0002', 2);
INSERT INTO salesDetail VALUES('TR000012','NB0003', 7);
INSERT INTO salesDetail VALUES('TR000013','AM0005', 2);
INSERT INTO salesDetail VALUES('TR000013','AP0002', 1);
INSERT INTO salesDetail VALUES('TR000014','PF0004', 10);
INSERT INTO salesDetail VALUES('TR000015','AK0003', 1);
INSERT INTO salesDetail VALUES('TR000015','AM0001', 1);
INSERT INTO salesDetail VALUES('TR000015','MD0002', 1);
INSERT INTO salesDetail VALUES('TR000015','PC0001', 1);
INSERT INTO salesDetail VALUES('TR000016','AP0002', 2);
INSERT INTO salesDetail VALUES('TR000016','NB0002', 7);
INSERT INTO salesDetail VALUES('TR000016','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000016','PR0002', 1);
INSERT INTO salesDetail VALUES('TR000017','PA0001', 3);
INSERT INTO salesDetail VALUES('TR000017','PA0002', 4);
INSERT INTO salesDetail VALUES('TR000018','MD0001', 9);
INSERT INTO salesDetail VALUES('TR000018','PC0004', 9);
INSERT INTO salesDetail VALUES('TR000019','AP0002', 2);
INSERT INTO salesDetail VALUES('TR000020','MD0005', 1);
INSERT INTO salesDetail VALUES('TR000021','AM0002', 3);
INSERT INTO salesDetail VALUES('TR000021','NB0002', 3);
INSERT INTO salesDetail VALUES('TR000022','MD0006', 5);
INSERT INTO salesDetail VALUES('TR000022','PA0002', 1);
INSERT INTO salesDetail VALUES('TR000022','PC0002', 5);
INSERT INTO salesDetail VALUES('TR000023','NB0001', 1);
INSERT INTO salesDetail VALUES('TR000024','PA0002', 1);
INSERT INTO salesDetail VALUES('TR000025','AP0002', 1);
INSERT INTO salesDetail VALUES('TR000026','AM0005', 1);
INSERT INTO salesDetail VALUES('TR000026','MD0003', 1);
INSERT INTO salesDetail VALUES('TR000026','PC0001', 1);
INSERT INTO salesDetail VALUES('TR000027','NB0003', 3);
INSERT INTO salesDetail VALUES('TR000027','PF0003', 1);
INSERT INTO salesDetail VALUES('TR000028','AM0001', 2);
INSERT INTO salesDetail VALUES('TR000028','PF0004', 5);
INSERT INTO salesDetail VALUES('TR000029','PF0001', 3);
INSERT INTO salesDetail VALUES('TR000030','AM0001', 5);
INSERT INTO salesDetail VALUES('TR000030','PA0001', 5);
INSERT INTO salesDetail VALUES('TR000030','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000030','PR0003', 2);
INSERT INTO salesDetail VALUES('TR000031','AM0003', 20);
INSERT INTO salesDetail VALUES('TR000032','NB0004', 3);
INSERT INTO salesDetail VALUES('TR000032','PA0002', 2);
INSERT INTO salesDetail VALUES('TR000033','NB0001', 3);
INSERT INTO salesDetail VALUES('TR000034','MD0003', 1);
INSERT INTO salesDetail VALUES('TR000034','PC0001', 1);
INSERT INTO salesDetail VALUES('TR000035','NH0003', 3);
INSERT INTO salesDetail VALUES('TR000035','PC0004', 10);
INSERT INTO salesDetail VALUES('TR000035','PR0002', 2);
INSERT INTO salesDetail VALUES('TR000036','MD0005', 5);
INSERT INTO salesDetail VALUES('TR000037','AM0002', 10);
INSERT INTO salesDetail VALUES('TR000037','PC0004', 5);
INSERT INTO salesDetail VALUES('TR000038','AD0003', 1);
INSERT INTO salesDetail VALUES('TR000038','AK0001', 3);
INSERT INTO salesDetail VALUES('TR000038','PA0001', 3);
INSERT INTO salesDetail VALUES('TR000038','PC0003', 3);
INSERT INTO salesDetail VALUES('TR000039','NB0004', 10);
INSERT INTO salesDetail VALUES('TR000039','NH0002', 2);
INSERT INTO salesDetail VALUES('TR000039','PF0001', 1);
INSERT INTO salesDetail VALUES('TR000039','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000040','NB0002', 15);
INSERT INTO salesDetail VALUES('TR000041','NB0001', 5);
INSERT INTO salesDetail VALUES('TR000041','PR0002', 2);
INSERT INTO salesDetail VALUES('TR000042','AM0005', 3);
INSERT INTO salesDetail VALUES('TR000042','AP0003', 1);
INSERT INTO salesDetail VALUES('TR000043','AD0003', 3);
INSERT INTO salesDetail VALUES('TR000043','NB0004', 5);
INSERT INTO salesDetail VALUES('TR000043','NH0003', 2);
INSERT INTO salesDetail VALUES('TR000043','PA0001', 5);
INSERT INTO salesDetail VALUES('TR000043','PF0001', 2);
INSERT INTO salesDetail VALUES('TR000044','AD0002', 2);
INSERT INTO salesDetail VALUES('TR000044','PC0001', 3);
INSERT INTO salesDetail VALUES('TR000045','AM0004', 5);
INSERT INTO salesDetail VALUES('TR000045','MD0003', 5);
INSERT INTO salesDetail VALUES('TR000045','PC0004', 5);
INSERT INTO salesDetail VALUES('TR000046','AP0001', 1);
INSERT INTO salesDetail VALUES('TR000046','NB0002', 10);
INSERT INTO salesDetail VALUES('TR000047','PA0001', 1);
INSERT INTO salesDetail VALUES('TR000048','AM0005', 3);
INSERT INTO salesDetail VALUES('TR000048','MD0001', 5);
INSERT INTO salesDetail VALUES('TR000048','PC0003', 5);
INSERT INTO salesDetail VALUES('TR000048','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000048','PR0003', 2);
INSERT INTO salesDetail VALUES('TR000049','MP0001', 10);
INSERT INTO salesDetail VALUES('TR000049','MP0003', 10);
INSERT INTO salesDetail VALUES('TR000050','NT0005', 1);
INSERT INTO salesDetail VALUES('TR000051','MP0001', 15);
INSERT INTO salesDetail VALUES('TR000051','MP0004', 15);
INSERT INTO salesDetail VALUES('TR000051','NT0001', 15);
INSERT INTO salesDetail VALUES('TR000052','MP0001', 10);
INSERT INTO salesDetail VALUES('TR000052','MP0003', 10);
INSERT INTO salesDetail VALUES('TR000052','NT0001', 10);
INSERT INTO salesDetail VALUES('TR000053','AK0002', 20);
INSERT INTO salesDetail VALUES('TR000053','AM0002', 20);
INSERT INTO salesDetail VALUES('TR000053','AP0002', 2);
INSERT INTO salesDetail VALUES('TR000053','MD0001', 20);
INSERT INTO salesDetail VALUES('TR000053','PC0004', 20);
INSERT INTO salesDetail VALUES('TR000054','AP0001', 1);
INSERT INTO salesDetail VALUES('TR000054','NB0001', 10);
INSERT INTO salesDetail VALUES('TR000055','AD0003', 3);
INSERT INTO salesDetail VALUES('TR000055','NH0003', 2);
INSERT INTO salesDetail VALUES('TR000055','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000055','PR0003', 2);
INSERT INTO salesDetail VALUES('TR000055','PS0001', 1);
INSERT INTO salesDetail VALUES('TR000056','NB0004', 5);
INSERT INTO salesDetail VALUES('TR000056','PA0002', 2);
INSERT INTO salesDetail VALUES('TR000056','PF0005', 1);
INSERT INTO salesDetail VALUES('TR000057','AD0004', 2);
INSERT INTO salesDetail VALUES('TR000057','NH0002', 2);
INSERT INTO salesDetail VALUES('TR000057','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000057','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000058','MD0005', 2);
INSERT INTO salesDetail VALUES('TR000058','PS0001', 1);
INSERT INTO salesDetail VALUES('TR000059','MP0001', 5);
INSERT INTO salesDetail VALUES('TR000059','NT0002', 5);
INSERT INTO salesDetail VALUES('TR000060','AD0004', 2);
INSERT INTO salesDetail VALUES('TR000060','MP0001', 3);
INSERT INTO salesDetail VALUES('TR000060','PS0002', 1);
INSERT INTO salesDetail VALUES('TR000060','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000061','MP0001', 5);
INSERT INTO salesDetail VALUES('TR000061','MP0003', 5);
INSERT INTO salesDetail VALUES('TR000062','AD0002', 2);
INSERT INTO salesDetail VALUES('TR000062','NH0003', 3);
INSERT INTO salesDetail VALUES('TR000062','NT0006', 2);
INSERT INTO salesDetail VALUES('TR000062','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000063','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000064','MD0002', 2);
INSERT INTO salesDetail VALUES('TR000064','PC0004', 5);
INSERT INTO salesDetail VALUES('TR000064','PF0001', 2);
INSERT INTO salesDetail VALUES('TR000064','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000064','PS0001', 1);
INSERT INTO salesDetail VALUES('TR000065','NB0004', 5);
INSERT INTO salesDetail VALUES('TR000065','PA0002', 2);
INSERT INTO salesDetail VALUES('TR000066','AM0002', 15);
INSERT INTO salesDetail VALUES('TR000066','MP0003', 15);
INSERT INTO salesDetail VALUES('TR000066','NB0002', 15);
INSERT INTO salesDetail VALUES('TR000067','NH0002', 3);
INSERT INTO salesDetail VALUES('TR000067','PS0003', 3);
INSERT INTO salesDetail VALUES('TR000068','MP0001', 2);
INSERT INTO salesDetail VALUES('TR000069','MP0003', 1);
INSERT INTO salesDetail VALUES('TR000070','NT0001', 3);
INSERT INTO salesDetail VALUES('TR000071','NT0003', 1);
INSERT INTO salesDetail VALUES('TR000072','NT0005', 1);
INSERT INTO salesDetail VALUES('TR000073','AP0002', 5);
INSERT INTO salesDetail VALUES('TR000073','PC0004', 40);
INSERT INTO salesDetail VALUES('TR000073','PR0001', 1);
INSERT INTO salesDetail VALUES('TR000074','AM0002', 2);
INSERT INTO salesDetail VALUES('TR000074','PC0002', 20);
INSERT INTO salesDetail VALUES('TR000074','PF0001', 1);
INSERT INTO salesDetail VALUES('TR000075','AM0001', 10);
INSERT INTO salesDetail VALUES('TR000075','AP0003', 2);
INSERT INTO salesDetail VALUES('TR000075','NB0001', 10);
INSERT INTO salesDetail VALUES('TR000075','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000076','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000077','NB0005', 2);
INSERT INTO salesDetail VALUES('TR000078','NB0005', 10);
INSERT INTO salesDetail VALUES('TR000079','AD0004', 2);
INSERT INTO salesDetail VALUES('TR000079','PS0001', 1);
INSERT INTO salesDetail VALUES('TR000080','NB0005', 3);
INSERT INTO salesDetail VALUES('TR000081','NB0005', 4);
INSERT INTO salesDetail VALUES('TR000081','PA0002', 4);
INSERT INTO salesDetail VALUES('TR000082','PC0002', 20);
INSERT INTO salesDetail VALUES('TR000082','PF0005', 1);
INSERT INTO salesDetail VALUES('TR000083','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000083','PA0002', 5);
INSERT INTO salesDetail VALUES('TR000084','AM0001', 2);
INSERT INTO salesDetail VALUES('TR000084','NB0005', 4);
INSERT INTO salesDetail VALUES('TR000084','NH0003', 5);
INSERT INTO salesDetail VALUES('TR000084','PS0002', 1);
INSERT INTO salesDetail VALUES('TR000085','AP0002', 2);
INSERT INTO salesDetail VALUES('TR000085','PC0002', 10);
INSERT INTO salesDetail VALUES('TR000085','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000086','AD0003', 3);
INSERT INTO salesDetail VALUES('TR000086','MD0004', 5);
INSERT INTO salesDetail VALUES('TR000086','PC0003', 10);
INSERT INTO salesDetail VALUES('TR000087','AM0001', 10);
INSERT INTO salesDetail VALUES('TR000087','PC0001', 3);
INSERT INTO salesDetail VALUES('TR000087','PC0004', 7);
INSERT INTO salesDetail VALUES('TR000087','PF0004', 2);
INSERT INTO salesDetail VALUES('TR000088','NH0003', 3);
INSERT INTO salesDetail VALUES('TR000088','PR0001', 5);
INSERT INTO salesDetail VALUES('TR000088','PS0001', 5);
INSERT INTO salesDetail VALUES('TR000089','NB0005', 10);
INSERT INTO salesDetail VALUES('TR000090','NB0005', 3);
INSERT INTO salesDetail VALUES('TR000090','NH0001', 1);
INSERT INTO salesDetail VALUES('TR000090','NH0003', 2);
INSERT INTO salesDetail VALUES('TR000090','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000091','AD0003', 2);
INSERT INTO salesDetail VALUES('TR000091','NT0001', 3);
INSERT INTO salesDetail VALUES('TR000091','NT0005', 2);
INSERT INTO salesDetail VALUES('TR000091','PS0002', 1);
INSERT INTO salesDetail VALUES('TR000092','AD0003', 2);
INSERT INTO salesDetail VALUES('TR000092','AM0001', 5);
INSERT INTO salesDetail VALUES('TR000092','NB0004', 2);
INSERT INTO salesDetail VALUES('TR000092','PC0001', 10);
INSERT INTO salesDetail VALUES('TR000092','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000093','MD0002', 10);
INSERT INTO salesDetail VALUES('TR000093','NH0003', 2);
INSERT INTO salesDetail VALUES('TR000093','PC0002', 20);
INSERT INTO salesDetail VALUES('TR000094','PC0002', 9);
INSERT INTO salesDetail VALUES('TR000094','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000095','MD0003', 3);
INSERT INTO salesDetail VALUES('TR000095','NB0003', 4);
INSERT INTO salesDetail VALUES('TR000096','AP0002', 2);
INSERT INTO salesDetail VALUES('TR000096','PA0001', 1);
INSERT INTO salesDetail VALUES('TR000097','NB0003', 3);
INSERT INTO salesDetail VALUES('TR000097','PC0004', 5);
INSERT INTO salesDetail VALUES('TR000098','NB0001', 2);
INSERT INTO salesDetail VALUES('TR000098','NT0001', 2);
INSERT INTO salesDetail VALUES('TR000098','PC0002', 10);
INSERT INTO salesDetail VALUES('TR000098','PF0004', 1);
INSERT INTO salesDetail VALUES('TR000099','NB0005', 3);
INSERT INTO salesDetail VALUES('TR000099','PS0002', 1);
INSERT INTO salesDetail VALUES('TR000099','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000100','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000100','NT0002', 3);
INSERT INTO salesDetail VALUES('TR000100','NT0004', 3);
INSERT INTO salesDetail VALUES('TR000100','PA0002', 5);
INSERT INTO salesDetail VALUES('TR000100','PC0002', 10);
INSERT INTO salesDetail VALUES('TR000101','AD0001', 2);
INSERT INTO salesDetail VALUES('TR000101','NH0003', 1);
INSERT INTO salesDetail VALUES('TR000101','PC0001', 10);
INSERT INTO salesDetail VALUES('TR000101','PF0006', 1);
INSERT INTO salesDetail VALUES('TR000102','MD0001', 10);
INSERT INTO salesDetail VALUES('TR000102','NH0002', 1);
INSERT INTO salesDetail VALUES('TR000102','PC0004', 10);
INSERT INTO salesDetail VALUES('TR000102','PS0003', 1);
INSERT INTO salesDetail VALUES('TR000103','AK0001', 15);
INSERT INTO salesDetail VALUES('TR000103','AM0004', 15);
INSERT INTO salesDetail VALUES('TR000103','MD0006', 15);
INSERT INTO salesDetail VALUES('TR000103','PC0004', 15);
INSERT INTO salesDetail VALUES('TR000104','MP0002', 2);
INSERT INTO salesDetail VALUES('TR000104','MP0003', 3);
INSERT INTO salesDetail VALUES('TR000104','NB0005', 2);
INSERT INTO salesDetail VALUES('TR000105','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000106','NB0005', 4);
INSERT INTO salesDetail VALUES('TR000107','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000108','MP0001', 1);
INSERT INTO salesDetail VALUES('TR000108','NT0005', 1);
INSERT INTO salesDetail VALUES('TR000109','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000110','MP0003', 2);
INSERT INTO salesDetail VALUES('TR000111','NB0005', 2);
INSERT INTO salesDetail VALUES('TR000112','NB0001', 2);
INSERT INTO salesDetail VALUES('TR000113','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000114','AP0003', 1);
INSERT INTO salesDetail VALUES('TR000115','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000115','NT0001', 1);
INSERT INTO salesDetail VALUES('TR000116','MP0003', 1);
INSERT INTO salesDetail VALUES('TR000116','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000117','NT0005', 1);
INSERT INTO salesDetail VALUES('TR000118','NB0005', 1);
INSERT INTO salesDetail VALUES('TR000119','NB0005', 20);
INSERT INTO salesDetail VALUES('TR000119','PC0004', 100);
INSERT INTO salesDetail VALUES('TR000120','AD0003', 10);
INSERT INTO salesDetail VALUES('TR000120','NH0003', 20);
INSERT INTO salesDetail VALUES('TR000120','PC0004', 150);
INSERT INTO salesDetail VALUES('TR000120','PR0003', 10);
INSERT INTO salesDetail VALUES('TR000120','PS0001', 5);
INSERT INTO salesDetail VALUES('TR000120','PS0003', 3);
INSERT INTO salesDetail VALUES('TR000121','NB0005', 5);
INSERT INTO salesDetail VALUES('TR000121','NH0003', 5);
INSERT INTO salesDetail VALUES('TR000121','NT0001', 5);
INSERT INTO salesDetail VALUES('TR000121','PC0002', 20);
INSERT INTO salesDetail VALUES('TR000122','AP0002', 1);
INSERT INTO salesDetail VALUES('TR000122','NB0005', 10);
INSERT INTO salesDetail VALUES('TR000122','NH0003', 5);
INSERT INTO salesDetail VALUES('TR000122','PC0003', 30);
INSERT INTO salesDetail VALUES('TR000122','PF0001', 5);
INSERT INTO salesDetail VALUES('TR000122','PR0002', 5);
INSERT INTO salesDetail VALUES('TR000122','PS0003', 3);
INSERT INTO salesDetail VALUES('TR000123','AD0001', 5);
INSERT INTO salesDetail VALUES('TR000123','NH0003', 3);
INSERT INTO salesDetail VALUES('TR000123','NT0001', 3);
INSERT INTO salesDetail VALUES('TR000123','PC0004', 60);
INSERT INTO salesDetail VALUES('TR000123','PF0005', 5);
INSERT INTO salesDetail VALUES('TR000123','PF0006', 3);
INSERT INTO salesDetail VALUES('TR000123','PR0003', 5);
INSERT INTO salesDetail VALUES('TR000123','PS0001', 2);
INSERT INTO salesDetail VALUES('TR000124','AM0002', 10);
INSERT INTO salesDetail VALUES('TR000124','MD0006', 5);
INSERT INTO salesDetail VALUES('TR000124','NB0005', 3);
INSERT INTO salesDetail VALUES('TR000124','PC0002', 15);
INSERT INTO salesDetail VALUES('TR000124','PF0005', 3);
INSERT INTO salesDetail VALUES('TR000124','PF0006', 2);
INSERT INTO salesDetail VALUES('TR000124','PS0001', 3);

-- Create table PAYMENT
CREATE TABLE payment (orNo VARCHAR(8) NOT NULL PRIMARY KEY, 
											  payDate DATE, 
											  amount DECIMAL(10,2), 
											  transno VARCHAR(8) REFERENCES  sales);

-- Insert PAYMENT rows 
INSERT INTO payment VALUES('OR000001','2010-06-20', '3284.7', 'TR000001');
INSERT INTO payment VALUES('OR000002','2010-07-05', '1581.72', 'TR000002');
INSERT INTO payment VALUES('OR000003','2010-07-05', '7.5', 'TR000003');
INSERT INTO payment VALUES('OR000004','2010-07-07', '57.74', 'TR000007');
INSERT INTO payment VALUES('OR000005','2010-07-09', '924.99', 'TR000005');
INSERT INTO payment VALUES('OR000006','2010-07-10', '3000', 'TR000004');
INSERT INTO payment VALUES('OR000007','2010-07-10', '309.22', 'TR000009');
INSERT INTO payment VALUES('OR000008','2010-07-12', '1393', 'TR000012');
INSERT INTO payment VALUES('OR000009','2010-07-12', '740.97', 'TR000015');
INSERT INTO payment VALUES('OR000010','2010-07-15', '1000', 'TR000006');
INSERT INTO payment VALUES('OR000011','2010-07-20', '1000', 'TR000010');
INSERT INTO payment VALUES('OR000012','2010-07-20', '1500', 'TR000011');
INSERT INTO payment VALUES('OR000013','2010-07-27', '2000', 'TR000016');
INSERT INTO payment VALUES('OR000014','2010-08-01', '403.02', 'TR000013');
INSERT INTO payment VALUES('OR000015','2010-08-01', '500', 'TR000014');
INSERT INTO payment VALUES('OR000016','2010-08-01', '4000', 'TR000018');
INSERT INTO payment VALUES('OR000017','2010-08-05', '907.5', 'TR000020');
INSERT INTO payment VALUES('OR000018','2010-08-07', '1095', 'TR000006');
INSERT INTO payment VALUES('OR000019','2010-08-10', '1000', 'TR000008');
INSERT INTO payment VALUES('OR000020','2010-08-10', '300', 'TR000023');
INSERT INTO payment VALUES('OR000021','2010-08-10', '102.99', 'TR000024');
INSERT INTO payment VALUES('OR000022','2010-08-10', '304.48', 'TR000025');
INSERT INTO payment VALUES('OR000023','2010-08-12', '1000', 'TR000017');
INSERT INTO payment VALUES('OR000024','2010-08-15', '1598.25', 'TR000011');
INSERT INTO payment VALUES('OR000025','2010-08-15', '1919.12', 'TR000018');
INSERT INTO payment VALUES('OR000026','2010-08-20', '767.77', 'TR000026');
INSERT INTO payment VALUES('OR000027','2010-08-20', '700.4', 'TR000004');
INSERT INTO payment VALUES('OR000028','2010-08-23', '608.96', 'TR000019');
INSERT INTO payment VALUES('OR000029','2010-08-30', '1000', 'TR000022');
INSERT INTO payment VALUES('OR000030','2010-08-30', '623.25', 'TR000027');
INSERT INTO payment VALUES('OR000031','2010-09-01', '500', 'TR000021');
INSERT INTO payment VALUES('OR000032','2010-09-05', '498.59', 'TR000028');
INSERT INTO payment VALUES('OR000033','2010-09-05', '429', 'TR000031');
INSERT INTO payment VALUES('OR000034','2010-09-06', '900', 'TR000033');
INSERT INTO payment VALUES('OR000035','2010-09-06', '718.5', 'TR000034');
INSERT INTO payment VALUES('OR000036','2010-09-10', '337.5', 'TR000029');
INSERT INTO payment VALUES('OR000037','2010-09-10', '601.78', 'TR000021');
INSERT INTO payment VALUES('OR000038','2010-09-10', '776.54', 'TR000022');
INSERT INTO payment VALUES('OR000039','2010-09-20', '1000', 'TR000032');
INSERT INTO payment VALUES('OR000040','2010-09-20', '4000', 'TR000035');
INSERT INTO payment VALUES('OR000041','2010-09-30', '1000', 'TR000030');
INSERT INTO payment VALUES('OR000042','2010-09-30', '4000', 'TR000036');
INSERT INTO payment VALUES('OR000043','2010-09-30', '1000', 'TR000038');
INSERT INTO payment VALUES('OR000044','2010-10-01', '1699.98', 'TR000041');
INSERT INTO payment VALUES('OR000045','2010-10-10', '539.17', 'TR000030');
INSERT INTO payment VALUES('OR000046','2010-10-10', '2095.05', 'TR000035');
INSERT INTO payment VALUES('OR000047','2010-10-10', '3417.2', 'TR000037');
INSERT INTO payment VALUES('OR000048','2010-10-23', '917.44', 'TR000038');
INSERT INTO payment VALUES('OR000049','2010-10-23', '2000', 'TR000039');
INSERT INTO payment VALUES('OR000050','2010-10-25', '3000', 'TR000040');
INSERT INTO payment VALUES('OR000051','2010-10-30', '522.68', 'TR000042');
INSERT INTO payment VALUES('OR000052','2010-11-10', '1470', 'TR000040');
INSERT INTO payment VALUES('OR000053','2010-11-20', '959.3', 'TR000039');
INSERT INTO payment VALUES('OR000054','2010-11-20', '2000', 'TR000043');
INSERT INTO payment VALUES('OR000055','2010-11-20', '219', 'TR000047');
INSERT INTO payment VALUES('OR000056','2010-12-01', '1503.6', 'TR000044');
INSERT INTO payment VALUES('OR000057','2010-12-05', '3000', 'TR000045');
INSERT INTO payment VALUES('OR000058','2010-12-10', '3294.99', 'TR000046');
INSERT INTO payment VALUES('OR000059','2010-12-10', '6249.5', 'TR000049');
INSERT INTO payment VALUES('OR000060','2010-12-10', '499.99', 'TR000050');
INSERT INTO payment VALUES('OR000061','2010-12-20', '1472.55', 'TR000045');
INSERT INTO payment VALUES('OR000062','2011-01-02', '1500', 'TR000048');
INSERT INTO payment VALUES('OR000063','2011-01-05', '5000', 'TR000051');
INSERT INTO payment VALUES('OR000064','2011-01-15', '1516.26', 'TR000048');
INSERT INTO payment VALUES('OR000065','2011-01-15', '5000', 'TR000051');
INSERT INTO payment VALUES('OR000066','2011-01-15', '599.99', 'TR000063');
INSERT INTO payment VALUES('OR000067','2011-01-20', '399.9', 'TR000068');
INSERT INTO payment VALUES('OR000068','2011-01-20', '425', 'TR000069');
INSERT INTO payment VALUES('OR000069','2011-01-25', '1237.47', 'TR000070');
INSERT INTO payment VALUES('OR000070','2011-01-25', '287', 'TR000071');
INSERT INTO payment VALUES('OR000071','2011-01-25', '499.99', 'TR000072');
INSERT INTO payment VALUES('OR000072','2011-01-30', '10000', 'TR000053');
INSERT INTO payment VALUES('OR000073','2011-01-30', '1371.02', 'TR000062');
INSERT INTO payment VALUES('OR000074','2011-01-30', '5000', 'TR000066');
INSERT INTO payment VALUES('OR000075','2011-02-01', '1000', 'TR000054');
INSERT INTO payment VALUES('OR000076','2011-02-01', '3000', 'TR000058');
INSERT INTO payment VALUES('OR000077','2011-02-02', '2369.44', 'TR000077');
INSERT INTO payment VALUES('OR000078','2011-02-05', '5000', 'TR000052');
INSERT INTO payment VALUES('OR000079','2011-02-05', '3000', 'TR000055');
INSERT INTO payment VALUES('OR000080','2011-02-05', '1709.16', 'TR000056');
INSERT INTO payment VALUES('OR000081','2011-02-05', '800.77', 'TR000057');
INSERT INTO payment VALUES('OR000082','2011-02-07', '1500', 'TR000080');
INSERT INTO payment VALUES('OR000083','2011-02-10', '5374.4', 'TR000052');
INSERT INTO payment VALUES('OR000084','2011-02-10', '5654.2', 'TR000053');
INSERT INTO payment VALUES('OR000085','2011-02-10', '2314.99', 'TR000054');
INSERT INTO payment VALUES('OR000086','2011-02-10', '2015', 'TR000058');
INSERT INTO payment VALUES('OR000087','2011-02-10', '2624.7', 'TR000059');
INSERT INTO payment VALUES('OR000088','2011-02-10', '2043.81', 'TR000060');
INSERT INTO payment VALUES('OR000089','2011-02-10', '1500', 'TR000061');
INSERT INTO payment VALUES('OR000090','2011-02-10', '3343.98', 'TR000079');
INSERT INTO payment VALUES('OR000091','2011-02-15', '1624.75', 'TR000061');
INSERT INTO payment VALUES('OR000092','2011-02-15', '6451.8', 'TR000064');
INSERT INTO payment VALUES('OR000093','2011-02-15', '1600.98', 'TR000065');
INSERT INTO payment VALUES('OR000094','2011-02-15', '1874.94', 'TR000067');
INSERT INTO payment VALUES('OR000095','2011-02-15', '4067.98', 'TR000082');
INSERT INTO payment VALUES('OR000096','2011-02-15', '3000', 'TR000083');
INSERT INTO payment VALUES('OR000097','2011-02-17', '6935.8', 'TR000066');
INSERT INTO payment VALUES('OR000098','2011-02-25', '4217.74', 'TR000074');
INSERT INTO payment VALUES('OR000099','2011-02-25', '10041.28', 'TR000075');
INSERT INTO payment VALUES('OR000100','2011-02-25', '1184.72', 'TR000076');
INSERT INTO payment VALUES('OR000101','2011-02-25', '7000', 'TR000078');
INSERT INTO payment VALUES('OR000102','2011-02-25', '2054.16', 'TR000080');
INSERT INTO payment VALUES('OR000103','2011-02-25', '7000', 'TR000088');
INSERT INTO payment VALUES('OR000104','2011-02-25', '5000', 'TR000089');
INSERT INTO payment VALUES('OR000105','2011-02-26', '3000', 'TR000081');
INSERT INTO payment VALUES('OR000106','2011-03-01', '10000', 'TR000073');
INSERT INTO payment VALUES('OR000107','2011-03-01', '4000', 'TR000087');
INSERT INTO payment VALUES('OR000108','2011-03-02', '3046.32', 'TR000091');
INSERT INTO payment VALUES('OR000109','2011-03-02', '1788.73', 'TR000094');
INSERT INTO payment VALUES('OR000110','2011-03-05', '2150.84', 'TR000081');
INSERT INTO payment VALUES('OR000111','2011-03-05', '3438.55', 'TR000083');
INSERT INTO payment VALUES('OR000112','2011-03-05', '3000', 'TR000084');
INSERT INTO payment VALUES('OR000113','2011-03-05', '2626.12', 'TR000085');
INSERT INTO payment VALUES('OR000114','2011-03-05', '1587.88', 'TR000095');
INSERT INTO payment VALUES('OR000115','2011-03-05', '858.4', 'TR000096');
INSERT INTO payment VALUES('OR000116','2011-03-10', '7000', 'TR000088');
INSERT INTO payment VALUES('OR000117','2011-03-10', '6847.2', 'TR000089');
INSERT INTO payment VALUES('OR000118','2011-03-11', '13200.22', 'TR000073');
INSERT INTO payment VALUES('OR000119','2011-03-15', '3000', 'TR000086');
INSERT INTO payment VALUES('OR000120','2011-03-15', '3489.29', 'TR000098');
INSERT INTO payment VALUES('OR000121','2011-03-15', '3000', 'TR000100');
INSERT INTO payment VALUES('OR000122','2011-03-20', '2923.67', 'TR000088');
INSERT INTO payment VALUES('OR000123','2011-03-20', '2000', 'TR000092');
INSERT INTO payment VALUES('OR000124','2011-03-20', '4000', 'TR000093');
INSERT INTO payment VALUES('OR000125','2011-03-20', '1500', 'TR000097');
INSERT INTO payment VALUES('OR000126','2011-03-20', '4854.14', 'TR000099');
INSERT INTO payment VALUES('OR000127','2011-03-30', '4519.52', 'TR000090');
INSERT INTO payment VALUES('OR000128','2011-03-30', '3000', 'TR000100');
INSERT INTO payment VALUES('OR000129','2011-04-02', '3410.45', 'TR000092');
INSERT INTO payment VALUES('OR000130','2011-04-02', '2953.08', 'TR000093');
INSERT INTO payment VALUES('OR000131','2011-04-05', '1787', 'TR000097');
INSERT INTO payment VALUES('OR000132','2011-04-05', '5000', 'TR000102');
INSERT INTO payment VALUES('OR000133','2011-04-05', '3000', 'TR000103');
INSERT INTO payment VALUES('OR000134','2011-04-05', '2000', 'TR000106');
INSERT INTO payment VALUES('OR000135','2011-04-07', '699.94', 'TR000108');
INSERT INTO payment VALUES('OR000136','2011-04-07', '1184.72', 'TR000109');
INSERT INTO payment VALUES('OR000137','2011-04-07', '850', 'TR000110');
INSERT INTO payment VALUES('OR000138','2011-04-07', '2369.44', 'TR000111');
INSERT INTO payment VALUES('OR000139','2011-04-07', '600', 'TR000112');
INSERT INTO payment VALUES('OR000140','2011-04-07', '1184.72', 'TR000113');
INSERT INTO payment VALUES('OR000141','2011-04-07', '367.49', 'TR000114');
INSERT INTO payment VALUES('OR000142','2011-04-07', '1597.21', 'TR000115');
INSERT INTO payment VALUES('OR000143','2011-04-07', '1609.72', 'TR000116');
INSERT INTO payment VALUES('OR000144','2011-04-07', '499.99', 'TR000117');
INSERT INTO payment VALUES('OR000145','2011-04-07', '1184.72', 'TR000118');
INSERT INTO payment VALUES('OR000146','2011-04-10', '3000', 'TR000100');
INSERT INTO payment VALUES('OR000147','2011-04-10', '4000', 'TR000103');
INSERT INTO payment VALUES('OR000148','2011-04-13', '4839.91', 'TR000101');
INSERT INTO payment VALUES('OR000149','2011-04-20', '2321.48', 'TR000102');
INSERT INTO payment VALUES('OR000150','2011-04-20', '4689.05', 'TR000103');
INSERT INTO payment VALUES('OR000151','2011-04-20', '5923.6', 'TR000105');
INSERT INTO payment VALUES('OR000152','2011-04-20', '20000', 'TR000119');
INSERT INTO payment VALUES('OR000153','2011-04-20', '30000', 'TR000120');
INSERT INTO payment VALUES('OR000154','2011-04-30', '3000', 'TR000104');
INSERT INTO payment VALUES('OR000155','2011-04-30', '2738.88', 'TR000106');
INSERT INTO payment VALUES('OR000156','2011-04-30', '5923.6', 'TR000107');
INSERT INTO payment VALUES('OR000157','2011-04-30', '20000', 'TR000123');
INSERT INTO payment VALUES('OR000158','2011-05-01', '20000', 'TR000119');
INSERT INTO payment VALUES('OR000159','2011-05-05', '30000', 'TR000120');
INSERT INTO payment VALUES('OR000160','2011-05-10', '37494.4', 'TR000119');
INSERT INTO payment VALUES('OR000161','2011-05-15', '17872.99', 'TR000124');
INSERT INTO payment VALUES('OR000162','2011-05-20', '21898.9', 'TR000123');
INSERT INTO payment VALUES('OR000163','2011-05-30', '43708.17', 'TR000120');
INSERT INTO payment VALUES('OR000164','2011-05-30', '12804.3', 'TR000121');
INSERT INTO payment VALUES('OR000165','2011-05-30', '27587.77', 'TR000122');


-- Create table PRICEHIST
CREATE TABLE priceHist (effDate DATE NOT NULL, 
											  prodCode VARCHAR(6) NOT NULL REFERENCES product, 
											  unitPrice DECIMAL(10,2) CONSTRAINT unitP_ck 
											  CHECK (unitPrice > 0),  
											  PRIMARY KEY (effDate, prodCode));

--  Insert PRICEHIST rows 
INSERT INTO priceHist VALUES('2010-05-15','AK0001', 12);
INSERT INTO priceHist VALUES('2010-05-15','AK0002', 8.37);
INSERT INTO priceHist VALUES('2010-05-15','AK0003', 99.99);
INSERT INTO priceHist VALUES('2010-05-15','AM0001', 36.45);
INSERT INTO priceHist VALUES('2010-05-15','AM0002', 69.26);
INSERT INTO priceHist VALUES('2010-05-15','AM0003', 20.43);
INSERT INTO priceHist VALUES('2010-05-15','AM0004', 88.14);
INSERT INTO priceHist VALUES('2010-05-15','AM0005', 49.27);
INSERT INTO priceHist VALUES('2010-05-15','AP0001', 299.99);
INSERT INTO priceHist VALUES('2010-05-15','AP0002', 304.48);
INSERT INTO priceHist VALUES('2010-05-15','AP0003', 349.99);
INSERT INTO priceHist VALUES('2010-05-15','MD0001', 119.68);
INSERT INTO priceHist VALUES('2010-05-15','MD0002', 149.99);
INSERT INTO priceHist VALUES('2010-05-15','MD0003', 239.96);
INSERT INTO priceHist VALUES('2010-05-15','MD0004', 132.21);
INSERT INTO priceHist VALUES('2010-05-15','MD0005', 825);
INSERT INTO priceHist VALUES('2010-05-15','MD0006', 124.29);
INSERT INTO priceHist VALUES('2010-05-15','NB0001', 300);
INSERT INTO priceHist VALUES('2010-05-15','NB0002', 298);
INSERT INTO priceHist VALUES('2010-05-15','NB0003', 199);
INSERT INTO priceHist VALUES('2010-05-15','NB0004', 279);
INSERT INTO priceHist VALUES('2010-05-15','PA0001', 219);
INSERT INTO priceHist VALUES('2010-05-15','PA0002', 102.99);
INSERT INTO priceHist VALUES('2010-07-12','PC0001', 454.54);
INSERT INTO priceHist VALUES('2010-05-15','PC0001', 499.99);
INSERT INTO priceHist VALUES('2010-07-12','PC0002', 197.99);
INSERT INTO priceHist VALUES('2010-05-15','PC0002', 179.99);
INSERT INTO priceHist VALUES('2010-05-15','PC0003', 390);
INSERT INTO priceHist VALUES('2010-05-15','PC0004', 538);
INSERT INTO priceHist VALUES('2010-05-15','PF0001', 123.75);
INSERT INTO priceHist VALUES('2010-05-15','PF0002', 64.25);
INSERT INTO priceHist VALUES('2010-05-15','PF0003', 28.87);
INSERT INTO priceHist VALUES('2010-05-15','PF0004', 92.85);
INSERT INTO priceHist VALUES('2010-05-15','PF0005', 119);
INSERT INTO priceHist VALUES('2010-05-15','PF0006', 7.5);
INSERT INTO priceHist VALUES('2010-05-15','PR0001', 81.72);
INSERT INTO priceHist VALUES('2010-05-15','PR0002', 99.99);
INSERT INTO priceHist VALUES('2010-05-15','PR0003', 123);
INSERT INTO priceHist VALUES('2010-08-01','MD0001', 131.65);
INSERT INTO priceHist VALUES('2010-08-01','MD0002', 164.99);
INSERT INTO priceHist VALUES('2010-08-01','MD0003', 263.96);
INSERT INTO priceHist VALUES('2010-08-01','MD0004', 145.43);
INSERT INTO priceHist VALUES('2010-08-01','MD0005', 907.5);
INSERT INTO priceHist VALUES('2010-08-01','MD0006', 136.72);
INSERT INTO priceHist VALUES('2010-08-16','PF0001', 112.5);
INSERT INTO priceHist VALUES('2010-08-16','PF0002', 58.41);
INSERT INTO priceHist VALUES('2010-08-16','PF0003', 26.25);
INSERT INTO priceHist VALUES('2010-08-16','PF0004', 84.41);
INSERT INTO priceHist VALUES('2010-08-16','PF0005', 108.18);
INSERT INTO priceHist VALUES('2010-08-16','PF0006', 6.82);
INSERT INTO priceHist VALUES('2010-08-16','AM0001', 38.27);
INSERT INTO priceHist VALUES('2010-08-16','AM0002', 72.72);
INSERT INTO priceHist VALUES('2010-08-16','AM0003', 21.45);
INSERT INTO priceHist VALUES('2010-08-16','AM0004', 92.55);
INSERT INTO priceHist VALUES('2010-08-16','AM0005', 51.73);
INSERT INTO priceHist VALUES('2010-08-16','AP0001', 314.99);
INSERT INTO priceHist VALUES('2010-08-16','AP0002', 319.7);
INSERT INTO priceHist VALUES('2010-08-16','AP0003', 367.49);
INSERT INTO priceHist VALUES('2010-08-16','AD0001', 58);
INSERT INTO priceHist VALUES('2010-08-16','AD0002', 69.99);
INSERT INTO priceHist VALUES('2010-08-16','AD0003', 54.44);
INSERT INTO priceHist VALUES('2010-08-16','AD0004', 71.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0001', 21.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0002', 24.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0003', 171.69);
INSERT INTO priceHist VALUES('2010-12-01','NT0001', 412.49);
INSERT INTO priceHist VALUES('2010-12-01','NT0002', 324.99);
INSERT INTO priceHist VALUES('2010-12-01','NT0003', 287);
INSERT INTO priceHist VALUES('2010-12-01','NT0004', 219.89);
INSERT INTO priceHist VALUES('2010-12-01','NT0005', 499.99);
INSERT INTO priceHist VALUES('2010-12-01','NT0006', 57.99);
INSERT INTO priceHist VALUES('2010-12-01','PS0001', 3200);
INSERT INTO priceHist VALUES('2010-12-01','PS0002', 699.99);
INSERT INTO priceHist VALUES('2010-12-01','PS0003', 599.99);
INSERT INTO priceHist VALUES('2010-12-01','MP0001', 199.95);
INSERT INTO priceHist VALUES('2010-12-01','MP0002', 126.72);
INSERT INTO priceHist VALUES('2010-12-01','MP0003', 425);
INSERT INTO priceHist VALUES('2010-12-01','MP0004', 302);
INSERT INTO priceHist VALUES('2011-02-01','NB0005', 1184.72);

-- Add tracking columns to existing tables
ALTER TABLE product ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE';
ALTER TABLE product ADD COLUMN stamp VARCHAR(60);

ALTER TABLE priceHist ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE';
ALTER TABLE priceHist ADD COLUMN stamp VARCHAR(60);

-- Rights Scripts tables
CREATE TABLE users (userid VARCHAR(50) PRIMARY KEY,
										email VARCHAR(255) UNIQUE NOT NULL,
										username VARCHAR(255),
										user_type VARCHAR(20) DEFAULT 'USER',
										record_status VARCHAR(10) DEFAULT 'ACTIVE',
										stamp VARCHAR(60));

CREATE TABLE Module (Module_ID VARCHAR(50) PRIMARY KEY,
										 module_name VARCHAR(100),
										 record_status VARCHAR(10) DEFAULT 'ACTIVE',
										 stamp VARCHAR(60));

CREATE TABLE rights (Right_ID VARCHAR(50) PRIMARY KEY,
										 right_name VARCHAR(100),
										 record_status	VARCHAR(10) DEFAULT 'ACTIVE',
										 stamp VARCHAR(60));

CREATE TABLE user_module (userid VARCHAR(50) REFERENCES users(userid),
													Module_ID VARCHAR(50) REFERENCES Module(Module_ID),
													rights_value INTEGER DEFAULT 0,
													record_status VARCHAR(10) DEFAULT 'ACTIVE',
													stamp VARCHAR(60),
													PRIMARY KEY (userid, Module_ID));

CREATE TABLE UserModule_Rights (userid VARCHAR(50) REFERENCES users(userid),
																Right_ID VARCHAR(50) REFERENCES rights(Right_ID),
																right_value INTEGER DEFAULT 0,
																record_status VARCHAR(10) DEFAULT 'ACTIVE',
																stamp VARCHAR(60),
																PRIMARY KEY (userid, Right_ID));