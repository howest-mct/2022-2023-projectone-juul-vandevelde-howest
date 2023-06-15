from .Database import Database


class DataRepository:
    @staticmethod
    def json_or_formdata(request):
        if request.method != 'GET' and request.content_type == 'application/json':
            gegevens = request.get_json()
        else:
            gegevens = request.form.to_dict()
        return gegevens

    @staticmethod
    def read_users():
        sql = "SELECT * FROM user"
        return Database.get_rows(sql)

    @staticmethod
    def read_devices():
        sql = "SELECT * FROM device"
        return Database.get_rows(sql)

    @staticmethod
    def read_device_history(device_id):
        sql = "SELECT * FROM history WHERE device_id = %s ORDER BY history_id DESC LIMIT 15"
        params = [device_id]
        return Database.get_rows(sql, params)
    
    @staticmethod
    def read_device_history_today(device_id):
        sql = "SELECT * FROM history WHERE device_id = %s AND DATE(datetime) = CURDATE() ORDER BY history_id DESC"
        params = [device_id]
        return Database.get_rows(sql, params)
    
    @staticmethod
    def read_unlocks_per_user():
        sql = "SELECT u.first_name, COUNT(history.history_id) AS counter FROM user u LEFT JOIN history ON history.value = u.rfid_id AND history.device_id = 9 GROUP BY u.first_name ORDER BY history.history_id DESC"
        return Database.get_rows(sql)

    @staticmethod
    def read_most_recent_device_history(device_id):
        sql = "SELECT * FROM history WHERE device_id = %s ORDER BY history_id DESC LIMIT 1"
        params = [device_id]
        return Database.get_one_row(sql, params)

    @staticmethod
    def add_device_history(device_id, action_id, value, comment):
        sql = "INSERT INTO history (device_id, action_id, value, comment) VALUES (%s, %s, %s, %s)"
        params = [device_id, action_id, value, comment]
        return Database.execute_sql(sql, params)

    @staticmethod
    def check_rfid(id, password):
        sql = "SELECT COUNT(*) AS 'user_exists' FROM user WHERE rfid_id = %s AND rfid_password = %s"
        params = [id, password]
        return Database.get_one_row(sql, params)

    @staticmethod
    def check_login(username, password):
        sql = "SELECT COUNT(*) AS 'login_status' FROM user WHERE username = %s AND BINARY password = %s"
        params = [username, password]
        return Database.get_one_row(sql, params)

    @staticmethod
    def read_current_color():
        sql = "SELECT value FROM history WHERE device_id = 10 ORDER BY datetime DESC LIMIT 1"
        return Database.get_one_row(sql)

    @staticmethod
    def read_mail_history():
        sql = "SELECT device_id, (datetime) AS date, COUNT(history_id) AS deliveries FROM history WHERE (device_id IN (4, 5)) AND (value = 1) AND (datetime >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)) AND (datetime <= CURDATE() + INTERVAL 1 DAY) GROUP BY DATE(datetime) ORDER BY date ASC;"
        return Database.get_rows(sql)

    # @staticmethod
    # def read_status_lamp_by_id(id):
    #     sql = "SELECT * from lampen WHERE id = %s"
    #     params = [id]
    #     return Database.get_one_row(sql, params)

    # @staticmethod
    # def update_status_lamp(id, status):
    #     sql = "UPDATE lampen SET status = %s WHERE id = %s"
    #     params = [status, id]
    #     return Database.execute_sql(sql, params)

    # @staticmethod
    # def update_status_alle_lampen(status):
    #     sql = "UPDATE lampen SET status = %s"
    #     params = [status]
    #     return Database.execute_sql(sql, params)
