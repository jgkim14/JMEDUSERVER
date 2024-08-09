# import ctypes
# from sys import platform
# from pathlib import Path
# from ctypes.wintypes import MAX_PATH

# MAX_PATH = 260

# def get_documents_folder():
#     CSIDL_PERSONAL = 5
#     SHGFP_TYPE_CURRENT = 0
#     path_buf = ctypes.create_unicode_buffer(MAX_PATH)
#     ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, path_buf)
#     return path_buf.value

# if platform == "linux" or platform == "linux2":
#     documents_path = Path(__file__).parent.parent
# elif platform == "win32":
#     documents_path = Path(get_documents_folder())
    
# log_file_path = documents_path / 'Aligo(JMEDU)_logs.log'

# if not log_file_path.parent.exists():
#     log_file_path.parent.mkdir(parents=True, exist_ok=True)

import mysql.connector
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from utils.Aligo import Aligo
from utils.Models import QR_Request, QR_Response
from utils.DB_mysql import get_db_connection, procedure_attendance_contact
from utils.Error_handler import (
    add_exception_handlers,
    ValueErrorException,
    ForbiddenException,
    InternalServerErrorException,
    UnboundLocalErrorException,
    DatabaseErrorException
)

class IPWhitelistMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, allowed_ips: List[str]):
        super().__init__(app)
        self.allowed_ips = allowed_ips

    async def dispatch(self, request, call_next):
        client_ip = request.client.host
        if client_ip not in self.allowed_ips:
            raise ForbiddenException(detail="Access forbidden: Your IP address is not allowed")
        response = await call_next(request)
        return response

def create_app() -> FastAPI:
    app = FastAPI()
    # 허용된 IP 리스트 미들웨어 추가
    allowed_ips = ["127.0.0.1", "192.168.1.224"] # 예시로 로컬 IP와 특정 IP만 허용
    app.add_middleware(IPWhitelistMiddleware, allowed_ips=allowed_ips)
    
    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost"],  # 허용할 도메인
        allow_credentials=True,
        allow_methods=["*"],  # 모든 HTTP 메소드 허용 (GET, POST 등)
        allow_headers=["*"],  # 모든 헤더 허용
    )
    return app

aligo = Aligo()
app = create_app()
add_exception_handlers(app)

@app.post("/qr", response_model=QR_Response, summary="QR Code 수신")
def receive_qr(request_data: QR_Request) -> QR_Response:
    """
    출석 키호스크에서 QR코드를 전달 받아 Aligo Web 발신 후 성공 여부를 반환합니다.
    """
    try:
        cnx = get_db_connection()
        with cnx.cursor() as cursor:
            contact_result = procedure_attendance_contact(request_data.qr_data, cursor)
            cnx.commit()
        
        if isinstance(contact_result, str):
            return QR_Response(message=contact_result)
        
        number, name, status = contact_result
        if status == "leave":
            return QR_Response(message="금일 하원이 이미 완료되었습니다.", student_name=name)
        elif status == "wait":
            return QR_Response(message="대기 중입니다. 수업이 끝난 뒤 다시 시도해주세요.", student_name=name)
        elif status == "attend":
            attendance_status = "등원"
        elif status == "already":
            attendance_status = "하원"

        message, msg_type, title = aligo.send_sms(receiver_name=name, receiver_num=number, status=attendance_status)
        return QR_Response(message=f"{status}: {message}", student_name=name, send_result=msg_type)
    
    except ValueError as ve:
        raise ValueErrorException(detail=str(ve))
    except mysql.connector.Error as err:
        raise DatabaseErrorException(detail=str(err))
    except UnboundLocalError as ue:
        raise UnboundLocalErrorException(detail=str(ue))
    except Exception as e:
        raise InternalServerErrorException(detail=str(e))
    finally:
        if cnx and cnx.is_connected():
            cnx.close()