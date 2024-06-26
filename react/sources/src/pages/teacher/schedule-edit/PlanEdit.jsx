import React, { useEffect, useState } from "react";
import BasicBox from "../../../Components/manage-box/BasicBox";
import InputBox from "../../../Components/InputBox";
import { useParams } from "react-router-dom";
import { Toast, notify } from "../../../template/Toastify";
import Button from "../../../Components/ButtonTop";
import axios from "axios";

export default function PlanEdit() {
  const [data, setData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const { scheduleID } = useParams();
  const [subject, setSubject] = useState("");
  const [week, setWeek] = useState("");
  const [starttime, setStartTime] = useState("");
  const [endtime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  const [teacher, setTeacher] = useState("");
  const [PK, setPK] = useState("");
  console.log(data);
  //선생 정보 핸들러
  const handleTeacherChange = (newSubject) => {
    setSubject(newSubject.name);
    setPK(newSubject.pk);
  };

  //date 형식 맞춰주는 함수
  const formatDatePart = (dateString) => {
    if (dateString && dateString.includes("T")) {
      return new Date(dateString).toISOString().split("T")[0];
    }
    return dateString;
  };

  useEffect(() => {
    const loging = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/server/plan_view_detail`, {
          plan_pk: scheduleID,
        });
        setData(response.data.plans);
        const subjectsResponse = await axios.post(`${process.env.REACT_APP_SERVER_URL}/server/subjects_view`, {});
        const subjectsData = subjectsResponse.data.subjects;
        setSubjects(subjectsData);
      } catch (error) {
        // window.location.reload();
      }
    };

    loging();
  }, [scheduleID]);

  useEffect(() => {
    function setDefaultData() {
      setSubject(data[0].subject_name);
      setPK(data[0].subject);
      setStartTime(data[0].starttime);
      setWeek(data[0].week);
      setEndTime(data[0].endtime);
      setRoom(data[0].room);
    }
    if (data && data[0]) {
      setDefaultData();
    }
  }, [data]); // data가 변경될 때만 setDefaultData 실행

  function editSubmit() {
    // if(변경 선공시)
    notify({
      type: "success",
      text: "수정이 완료됐습니다.",
    });
    // if(변경 실패시)
    // notify({
    //   type: "warning",
    //   text: "수정에 실패했습니다.",
    // });
    // if(변경사항 없을 시)
    // notify({
    //   type: "error",
    //   text: "수정사항이 없습니다.",
    // });
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/server/plan_update`,
        JSON.stringify({
          plan_pk: scheduleID,
          subject: PK,
          week,
          starttime,
          endtime,
          room,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      notify({
        type: "success",
        text: "전송 중.",
      });

      if (response.data.success) {
        notify({
          type: "success",
          text: "전송 완료.",
        });
      }
    } catch (error) {
      notify({
        type: "error",
        text: "에러 발생.",
      });
      console.error("등록 중 오류 발생:", error);
    }
  };

  return (
    <>
      <BasicBox>
        <div className="pt-3">
          <InputBox
            data={subject}
            name={"수업 이름"}
            edit={handleTeacherChange}
            type={"picker"}
            table={"subject"}
            subData_picker={subjects}
          />
          <InputBox data={week} name={"week"} edit={setWeek} />
          <InputBox data={starttime} name={"시작 시간"} edit={setStartTime} type={"time"} />
          <InputBox data={endtime} name={"종료 시간"} edit={setEndTime} type={"time"} />
          <InputBox data={room} name={"room"} edit={setRoom} />
        </div>
        <div className="m-5 flex justify-end pr-10">
          <Button label={"수정하기"} onClick={handleSubmit} width={90} />
        </div>
      </BasicBox>
      <Toast />
    </>
  );
}
