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
    def read_devices():
        sql = "SELECT * from device"
        return Database.get_rows(sql)

    @staticmethod
    def read_history_by_device(device_id):
        sql = "SELECT * from history WHERE device_id = %s"
        params = [device_id]
        return Database.get_rows(sql, params)

    @staticmethod
    def add_history(history_id, device_id, action_id, datetime, value, comment):
        # insert statement eens goed nakijken
        # sql = "INSERT INTO history (history_id, device_id, action_id, datetime, value, comment) VALUES (%s, %s, %s, %s, %s, %s)"
        sql = ""
        params = [history_id, device_id, action_id, datetime, value, comment]
        return Database.execute_sql(sql, params)

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
