import React, { useEffect } from "react";
import DataTableV1 from "../../Components/dataTableV1/DataTableV1";
import SearchBox from "../../Components/searchBox/SearchBox";
import { useState } from "react";
import BasicBox from "../../Components/manage-box/BasicBox";
import axios from "axios";
import { EDIT_TEACHER } from "../../constants/searchFilter";
import { Toast, notify } from "../../template/Toastify";

export default function MainPageTeacher() {
  const [data, setData] = useState();

  //배열 정수형으로 변환
  function arrayToSqlInString(arr) {
    return arr.map((item) => `'${item}'`).join(", ");
  }

  useEffect(() => {
    loging();
  }, []);

  //데이터 가져오기
  async function loging() {
    try {
      const response = await axios.post("http://localhost/server/teacher_view", {});
      setData(response.data.teachers);
    } catch (error) {
      console.error(error);
    }
  }

  //데이터 수정 (한번에)
  async function dataSubmit_all(editText, studentArray) {
    try {
      const response = await axios.post("http://localhost/server/teachers_view_update_all", {
        editObject: editText,
        editTarget: arrayToSqlInString(studentArray),
      });
      if (response.data.success) {
        notify({
          type: "success",
          text: "수정이 완료됐습니다. 확인을 위해서는 새로고침을 해주세요",
        });
      } else {
        notify({
          type: "error",
          text: "수정 중 오류발생.",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  //데이터 테이블에 보일 컬럼
  const columns = [
    { columnName: "이름", data: "name" },
    { columnName: "성별", data: "sex_ism" },
  ];

  return (
    <>
      <BasicBox>
        <SearchBox setData={setData} option={"teacher"}></SearchBox>
        <DataTableV1
          title={"교직원관리 테이블"}
          columns={columns}
          datas={data}
          type="teacher"
          editType={EDIT_TEACHER}
          runSQL={dataSubmit_all}
        />
      </BasicBox>
      <Toast />
    </>
  );
}
