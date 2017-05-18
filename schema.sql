DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Question;
DROP TABLE IF EXISTS Scene;
DROP TABLE IF EXISTS Quiz;
DROP TABLE IF EXISTS Decision;
DROP TABLE IF EXISTS Answer;

CREATE TABLE Users (
  idUser BIGINT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE Question (
	idQuestion INTEGER PRIMARY KEY AUTO_INCREMENT,
	statement TEXT NOT NULL,
  scene INTEGER REFERENCES Scene(idScene)
);

CREATE TABLE Scene (
	idScene INTEGER PRIMARY KEY AUTO_INCREMENT,
  quiz INTEGER REFERENCES Quiz(idQuiz),
  name TEXT NOT NULL,
	lat DOUBLE NOT NULL,
	lon DOUBLE NOT NULL,
  heading DOUBLE,
  pitch DOUBLE,
  zoom DOUBLE,
  correctDecision BOOLEAN,
  signs TEXT NOT NULL
);

CREATE TABLE Quiz (
	idQuiz INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
	idUser BIGINT REFERENCES Users(idUser),
  state INTEGER DEFAULT 0,
  CONSTRAINT State_Ck CHECK (state BETWEEN 0 AND 2)
);

CREATE TABLE Decision (
  idDecision INTEGER PRIMARY KEY AUTO_INCREMENT,
  idUser BIGINT REFERENCES Users(idUser),
  idScene INTEGER REFERENCES Scene(idScene),
  decision BOOLEAN,
  decisionTime LONG
);

CREATE TABLE Answer (
  idAnswer INTEGER PRIMARY KEY AUTO_INCREMENT,
  idUser BIGINT REFERENCES Users(idUser),
  idQuestion INTEGER REFERENCES Question(idQuestion),
  answer BOOLEAN
);
