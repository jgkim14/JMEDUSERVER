require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

// CORS 설정: 모든 출처 허용 (개발 단계에서만)
app.use(cors());

const saltRounds = 10;

// 데이터베이스 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log("@@@@@@Connected to the MySQL server.@@@@@@");
});

// 미들웨어 설정
app.use(bodyParser.json()); // JSON 본문 처리
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 로그인 라우트
app.post("/server/login", (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  db.query("SELECT * FROM teacher WHERE id = ?", [username], (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: "서버에러" });
      return;
    }

    if (results.length > 0) {
      if (password == results[0].pwd) {
        req.session.user = results[0];
        res.json({ success: true, message: "로그인 성공" });
      } else {
        res.json({
          success: false,
          message: `비밀번호가 일치하지 않습니다. 필요 pw : ${results[0].pwd} 입력 pw : ${password}`,
        });
      }
    } else {
      res.json({ success: false, message: "없는 ID입니다." });
    }
  });
});

//////회원가입
app.post("/server/register", async (req, res) => {
  const { name, id, pwd, sex_ism, birthday, contact, is_admin } = req.body;
  console.log("가입 요청 들어옴");
  const hashedPassword = await bcrypt.hash(pwd, 10); // 비밀번호 해싱

  db.query("SELECT * FROM teacher WHERE id = ?", [username], (err, results) => {
    if (results.length) {
      res.status(200).send("이미 사용중인 ID입니다.");
    } else {
      // 데이터 삽입 쿼리
      const query =
        "INSERT INTO teacher (teacher_pk, name, id, pwd, sex_ism, birthday, contact, is_admin) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)";

      // 데이터베이스에 쿼리 실행
      db.query(
        query,
        [name, id, hashedPassword, sex_ism, birthday, contact, is_admin],
        (err, result) => {
          if (err) {
            console.error("데이터 삽입 중 오류 발생:", err);
            res.status(500).send("서버 오류가 발생했습니다.");
            return;
          }
          res.status(200).send("가입 완료.");
        }
      );
    }
  });
});

/////////////////////학생조회
app.get("/server/students_view", (req, res) => {
  db.query("SELECT * FROM student", (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true, students: results });
    }
  });
});

//////////////////////학생 자세히 보기
app.post("/server/students_view_detail", (req, res) => {
  const { student_pk } = req.body;
  db.query(
    "SELECT * FROM student where student_pk = ?",
    [student_pk],
    (error, results) => {
      if (error) {
        res.status(500).json({ success: false, message: "데이터베이스 오류" });
      } else {
        res.json({ success: true, students: results });
      }
    }
  );
});

//////////////////////학생 검색
app.post("/server/students_search", (req, res) => {
  const { search } = req.body;
  let query = "SELECT * FROM student";
  if (search.text != "") {
    query = `SELECT * FROM student where ${search.option} = '${search.text}'`;
  }
  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true, students: results, search: search });
    }
  });
});

//////////////////////학생 정보 수정
app.put("/server/students_view_update", (req, res) => {
  const {
    student_pk,
    name,
    sex_ism,
    birthday,
    contact,
    contact_parent,
    school,
    payday,
    firstreg,
  } = req.body;

  const query = `UPDATE student SET name = ?, sex_ism = ?, birthday = ?, contact = ? ,contact_parent = ?, school = ?, payday = ?, firstreg = ? WHERE student_pk = ?`;

  db.query(
    query,
    [
      name,
      sex_ism,
      birthday,
      contact,
      contact_parent,
      school,
      payday,
      firstreg,
      student_pk,
    ],
    (error, results) => {
      if (error) {
        res.status(500).json({ success: false, message: "데이터베이스 오류" });
      } else {
        res.json({ success: true });
      }
    }
  );
});

//////////////////////학생 정보 수정 (여러개 한번에)
app.put("/server/students_view_update_all", (req, res) => {
  const { editObject, editTarget } = req.body;

  const query = `UPDATE student SET ${editObject.option} = '${editObject.text}' WHERE student_pk IN (${editTarget})`;

  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true });
    }
  });
});

//조건부 공지
app.get("/server/condition_note", (req, res) => {
  const { name, sex_ism, contact, contact_parent, school, payday } = req.body;
  const selectAll = true;

  // 'student' 테이블 조회 쿼리문 넣기
  db.query(searchStudent, (error, results, fields) => {
    if (error) {
      // 데이터베이스 쿼리 중 오류 발생 시
      res
        .status(500)
        .json({ success: false, message: "데이터베이스 오류", error: error });
    } else {
      // 쿼리가 성공적으로 수행되면 결과 반환
      res.json({ success: true, students: results });
    }
  });
});

///////학생추가
app.post("/server/students_add", (req, res) => {
  const {
    name,
    sex_ism,
    birthday,
    contact,
    contact_parent,
    school,
    payday,
    firstreg,
  } = req.body;

  // 데이터 삽입 쿼리
  const query =
    "INSERT INTO student (student_pk, name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)";

  // 데이터베이스에 쿼리 실행
  db.query(
    query,
    [
      name,
      sex_ism,
      birthday,
      contact,
      contact_parent,
      school,
      payday,
      firstreg,
    ],
    (err, result) => {
      if (err) {
        console.error("데이터 삽입 중 오류 발생:", err);
        res.status(500).send("서버 오류가 발생했습니다.");
        return;
      }
      res.status(200).send("사용자가 성공적으로 등록되었습니다.");
    }
  );
});

// 대시보드 라우트
app.get("/server/dashboard", (req, res) => {
  if (req.session.user) {
    res.send("Welcome to your dashboard, " + req.session.user.username);
  } else {
    res.redirect("/server/login");
  }
});

// 로그아웃 라우트
app.get("/server/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/server/login");
});

/////키오스크에서 학생키를 받은 경우
app.post("/server/Kiosk_getStudent", (req, res) => {
  const { qrcode } = req.body;
  db.query(
    "SELECT * FROM student WHERE student_pk = ?",
    [qrcode],
    (err, results) => {
      if (err) {
        res.status(500).json({ success: false, message: "서버에러" });
        return;
      }

      if (results.length > 0) {
        const name = results[0].name;
        const birthday = results[0].birthday;
        const contact_parent = results[0].contact_parent;
        res.json({
          success: true,
          name: name,
          birthday: birthday,
          contact_parent: contact_parent,
        });
      } else {
        res.json({ success: false, message: "없는 ID입니다." });
      }
    }
  );
});

/////문자API 전송 요청
app.post("/server/submitAttend", (req, res) => {
  const { name, contact_parent, attend_code } = req.body;
  const msg = name + "학생이 지금 ";
  if (attend_code == 0) {
    msg = msg + "등원하였습니다.";
  } else if (attend_code == 1) {
    msg = msg + "하원하였습니다.";
  }
  try {
    const response = axios.post("http://localhost:5100/input", {
      msg,
      contact_parent,
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
});

// 서버 시작
app.listen(5002, () => {
  console.log("Server is running on port 5002");
});
