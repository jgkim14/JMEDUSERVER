//학생 추가, 수정, 삭제

const db = require("./db");
const express = require("express");
const router = express.Router();
const { logAttend, adminLog } = require("./logger");
const { checkAuthenticated } = require("./permission");
const { send, QRmaker } = require("./sendApi");
const QRCode = require('qrcode');


function makeStudentSearchQuery(text, option) {
  //console.log(body);
  let baseQuery = "SELECT * FROM student";
  let whereClauses = [];
  let queryParams = [];

  if (text !== "") {
    whereClauses.push(`${option} LIKE ?`);
    queryParams.push(text);
  }

  if (whereClauses.length > 0) {
    baseQuery += " WHERE deleted_at IS NULL" + whereClauses.join(" AND ");
  }

  return {
    query: baseQuery,
    params: queryParams,
  };
}

/////////////////////학생조회
router.post("/server/students_view", checkAuthenticated("students_view"), async (req, res) => {
  console.log("학생 조회가 실행되었음");

  db.query("SELECT * FROM student WHERE deleted_at IS NULL", (error, results) => {
    if (error) {
      console.log("학생 조회에서 오류 발생");
      console.log("-------------------에러 코드 -------------------");
      console.log(error);
      console.log("----------------------------------------------");
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true, students: results });
      adminLog(req.session.user, "전체 학생 목록을 조회했습니다.");
    }
  });
});

//////////////////////학생 검색
router.post("/server/students_search", checkAuthenticated("students_search"), async (req, res) => {
  const { search } = req.body;
  console.log(search);

  let query = "";
  let queryParams = [];

  if (search.text === "") {
    query = "SELECT * FROM student WHERE deleted_at IS NULL;";
  } else {
    // 특정 조건에 맞는 데이터를 가져옴
    query = `SELECT * FROM student WHERE ${search.option} = ? AND deleted_at IS NULL;`;
    queryParams = [search.text];
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true, datas: results, search: search });
      const logMsg = "학생 목록을 검색했습니다.";
      adminLog(req.session.user, logMsg);
    }
  });
});

//////////////////////학생 자세히 보기
router.post("/server/students_view_detail", checkAuthenticated("students_view_detail"), async (req, res) => {
  const { student_pk } = req.body;
  db.query("SELECT * from student WHERE student_pk = ? AND deleted_at IS NULL;", [student_pk], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true, students: results });
      const logMsg = "학생 자세히 보기를 했습니다. 학생 코드 : " + student_pk;
      adminLog(req.session.user, logMsg);
    }
  });
});

///////학생추가 페이지 로드
router.post("/server/students_addPage", checkAuthenticated("students_addPage"), async (req, res) => {
  db.query("SELECT school_pk, name FROM school WHERE deleted_at IS NULL", (error, results_school) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "데이터베이스 오류 : 학교 불러오기 실패",
      });
    } else {
      res.json({ success: true, schools: results_school });
    }
  });
});

///////학생추가
router.post("/server/students_add", checkAuthenticated("students_add"), async (req, res) => {
  const { name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg } = req.body;

  // 데이터 삽입 쿼리
  const query =
    "INSERT INTO student (student_pk, name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW());";

  // 데이터베이스에 쿼리 실행
  db.query(query, [name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg], (err, result) => {
    if (err) {
      console.error("데이터 삽입 중 오류 발생:", err);
      res.status(500).send("서버 오류가 발생했습니다.");
      return;
    }
    res.status(200).send("사용자가 성공적으로 등록되었습니다.");
    const logMsg = "새로운 학생을 추가했습니다. 이름 : " + name + ", 전화번호 : " + contact;
    adminLog(req.session.user, logMsg);
  });
});

/////////////학생 추가 (여러명)
router.post("/server/students_add_multiple", checkAuthenticated("students_add_multiple"), async (req, res) => {
  const studentsData = req.body.DataStudents;
  console.log(studentsData);

  // 데이터 삽입 쿼리
  const query =
    "INSERT INTO student (student_pk, name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
  console.log(studentsData);
  // 학생 데이터를 각각 데이터베이스에 삽입
  studentsData.forEach((student) => {
    const values = [
      student.name,
      student.sex_ism,
      student.birthday,
      student.contact,
      student.contact_parent,
      student.school,
      student.payday,
      student.firstreg,
    ];

    // 데이터베이스에 쿼리 실행
    db.query(query, values, async (err, result) => {
      if (err) {
        console.error("데이터 삽입 중 오류 발생:", err);
        res.status(500).send("서버 오류가 발생했습니다.");
        return;
      }
    });
  });

  res.status(200).send("사용자가 성공적으로 등록되었습니다.");
  adminLog(req.session.user, "여러 명의 학생 정보를 추가했습니다.");
});

//////////////////////학생 정보 수정
router.put("/server/students_view_update", checkAuthenticated("students_view_update"), async (req, res) => {
  const { student_pk, name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg } = req.body;

  const query = `UPDATE student SET name = ?, sex_ism = ?, birthday = ?, contact = ? ,contact_parent = ?, school = ?,payday = ?, firstreg = ?, updated_at = NOW() WHERE student_pk = ?`;

  db.query(
    query,
    [name, sex_ism, birthday, contact, contact_parent, school, payday, firstreg, student_pk],
    (error, results) => {
      if (error) {
        res.status(500).json({ success: false, message: "데이터베이스 오류" });
      } else {
        res.json({ success: true });
        adminLog(req.session.user, "학생 정보를 수정했습니다. 학생 코드 : " + student_pk);
      }
    }
  );
});

//////////////////////학생 정보 수정 (여러개 한번에)
router.post("/server/students_view_update_all", checkAuthenticated("students_view_update_all"), async (req, res) => {
  const { editObject, editTarget } = req.body;

  let query;

  if (editObject.option === "remove") {
    query = `DELETE FROM student WHERE student_pk IN (${editTarget})`;
  } else {
    query = `UPDATE student SET ${editObject.option} = '${editObject.text}' WHERE student_pk IN (${editTarget})`;
  }
  console.log("editobject:", editObject, "쿼리 : ", query);
  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "데이터베이스 오류" });
    } else {
      res.json({ success: true });
      adminLog(req.session.user, "여러 명의 학생 정보를 수정했습니다.");
    }
  });
});

//학생 삭제
router.post("/server/student_remove", checkAuthenticated("student_remove"), async (req, res) => {
  const { id } = req.body;

  // 데이터 삽입 쿼리
  const query = "UPDATE student SET deleted_at = NOW(),  WHERE student_pk = ?";

  // 데이터베이스에 쿼리 실행
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("데이터 삽입 중 오류 발생:", err);
      res.status(500).send("서버 오류가 발생했습니다.");
      return;
    }
    res.status(200).send("사용자가 성공적으로 등록되었습니다.");
  });
});

//////////////////////큐알 전송하기
router.post("/server/QR_send", checkAuthenticated("QR_send"), async (req, res) => {
  try {
    const { student_pk, name, contact } = req.body;

    // 필수 값이 누락되었는지 확인
    if (!student_pk || !name || !contact) {
      return res.status(400).json({ error: "필수 값이 누락되었습니다." });
    }

    // QR 코드 생성 로직 추가 (가정)
    const qr = await QRmaker(student_pk);

    const data = {
      sender: process.env.SMS_SENDER,
      receiver: contact,
      msg: `${name} 학생 등/하원 인증 QR코드입니다.`,
      msg_types: "MMS",
      title: "제이엠에듀 학생 QR코드 발송",
      image: qr
    };

    // 메시지 전송 함수 호출
    await send(data, res);

    res.status(200).json({ message: "QR 코드 전송에 성공했습니다." });
    
  } catch (error) {
    console.error("QR 코드 전송 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
});

//////////////////////큐알 전송하기
router.post("/server/QR_download", checkAuthenticated("QR_download"), async (req, res) => {
  try {
    const { student_pk, name } = req.body;

    // 필수 값이 누락되었는지 확인
    if (!student_pk || !name) {
      return res.status(400).json({ error: "필수 값이 누락되었습니다." });
    }

    QRCode.toFile(`${name}.png`, student_pk, function (err) {
      if (err) throw err;
      console.log(`${name}.png 파일로 전송 완료`);
    });

  } catch (error) {
    console.error("QR 코드 생성 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
});





module.exports = {
  router: router,
};
