import React, { useEffect } from "react";
import DataTableV1 from "../../Components/dataTableV1/DataTableV1";
import SearchBox from "../../Components/searchBox/SearchBox";
import { useState } from "react";
import BasicBox from "../../Components/manage-box/BasicBox";
import axios from "axios";

export default function MainPage() {
  const [data, setData] = useState();

  useEffect(() => {
    loging();
  }, []);

  async function loging() {
    try {
      const response = await axios.get(
        "http://localhost:5002/students_view",
        {}
      );
      setData(response.data.students);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  const columns = [
    { columnName: "이름", data: "name" },
    { columnName: "전화번호", data: "contact" },
    { columnName: "부모님 전화번호", data: "contact_parent" },
  ];

  return (
    <>
      <BasicBox>
        <SearchBox setData={setData} option={"student"}></SearchBox>
        <DataTableV1
          title={"학생관리 테이블"}
          columns={columns}
          datas={data}
          type="student"
        />
      </BasicBox>
    </>
  );
}
