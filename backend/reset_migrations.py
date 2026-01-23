from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    db.session.execute(text('DELETE FROM alembic_version'))
    db.session.execute(text("INSERT INTO alembic_version (version_num) VALUES ('60fe4a8da6a4')"))
    db.session.commit()
    print('Reset alembic_version to 60fe4a8da6a4')
