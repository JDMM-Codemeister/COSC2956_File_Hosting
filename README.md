#Setup Instructions#  
1. Install PostgreSQL (psql) on computer
2. Set up psql database (DB)
3. Make 2 tables in psql DB
  1. *files* -   
    Column    |            Type             | Collation | Nullable |              Default
  -------------+-----------------------------+-----------+----------+-----------------------------------
   id          | integer                     |           | not null | nextval('files_id_seq'::regclass)
   user_id     | integer                     |           |          |
   filename    | character varying(255)      |           | not null |
   path        | character varying(255)      |           | not null |
   uploaded_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP
   file_size   | integer                     |           |          |
  Indexes:
      "files_pkey" PRIMARY KEY, btree (id)
  Foreign-key constraints:
      "files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)  
  2. *users* -    
  Column   |            Type             | Collation | Nullable |              Default
  ------------+-----------------------------+-----------+----------+-----------------------------------
   id         | integer                     |           | not null | nextval('users_id_seq'::regclass)
   email      | character varying(255)      |           | not null |
   password   | character varying(255)      |           | not null |
   created_at | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
  Indexes:
      "users_pkey" PRIMARY KEY, btree (id)
      "users_email_key" UNIQUE CONSTRAINT, btree (email)
  Referenced by:
      TABLE "files" CONSTRAINT "files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)  


#Endpoints#  

##POST /login##  

##POST /register##  

##POST /upload##  

##DELETE /delete##  

##GET /show-all-files##  

##GET /show-my-files##  

