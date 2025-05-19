from django.utils import timezone
from datetime import timedelta
from .models import Task

def create_cpd_tasks(project):
    cpd_tasks = [
        {
            "title": "Заполнить паспорт проекта для первого промежуточного отчета",
            "description": "Создать и заполнить паспорт проекта, включая название, список участников, преподавателя, заказчика, цели, задачи, этапы реализации и дорожную карту на два семестра. Использовать шаблон Московского Политеха.",
            "status": "Новая",
            "priority": "Высокий",
            "points": 5,
            "tag_id": 1,
            "start_date": timezone.now().date(),
            "due_date": (timezone.now() + timedelta(days=14)).date(),
        },
        {
            "title": "Создать презентацию для первого промежуточного отчета",
            "description": "Подготовить презентацию (не более 15 слайдов) по шаблону Московского Политеха. Включить: титульный лист, актуальность, проблематику, цели и задачи, структуру работы, взаимодействие с заказчиком, планируемый результат, дорожную карту, диаграмму Ганта, слайд 'Спасибо за внимание'.",
            "status": "Новая",
            "priority": "Высокий",
            "points": 8,
            "tag_id": 1,
            "start_date": timezone.now().date(),
            "due_date": (timezone.now() + timedelta(days=14)).date(),
        },
        {
            "title": "Подготовить текстовую часть проектной документации",
            "description": "Написать текстовую часть документации для первого промежуточного отчета. Включить: титульный лист, список исполнителей, заказчика, содержание, актуальность, цели и задачи, описание результатов, промежуточный продуктовый результат, заключение, список источников (по ГОСТ Р 7.0.100-2018). Оформить: Times New Roman 14, полуторный интервал, поля 2-1-2-2 см, абзацный отступ 1.25 см.",
            "status": "Новая",
            "priority": "Высокий",
            "points": 7,
            "tag_id": 1,
            "start_date": timezone.now().date(),
            "due_date": (timezone.now() + timedelta(days=14)).date(),
        },
        {
            "title": "Заполнить журнал посещений за первый семестр",
            "description": "Внести данные о посещении занятий по проекту в личный кабинет преподавателя. Указать даты и присутствующих участников. Проверить актуальность данных перед сдачей первого промежуточного отчета.",
            "status": "Новая",
            "priority": "Средний",
            "points": 3,
            "tag_id": 1,
            "start_date": timezone.now().date(),
            "due_date": (timezone.now() + timedelta(days=14)).date(),
        },
        {
            "title": "Создать диаграмму Ганта для первого отчета",
            "description": "Разработать диаграмму Ганта, отражающую этапы проекта на фактическую дату сдачи первого промежуточного отчета. Включить в презентацию и документацию.",
            "status": "Новая",
            "priority": "Средний",
            "points": 4,
            "tag_id": 1,
            "start_date": timezone.now().date(),
            "due_date": (timezone.now() + timedelta(days=14)).date(),
        }
    ]

    for task_data in cpd_tasks:
        Task.objects.create(
            project=project,
            title=task_data["title"],
            description=task_data["description"],
            status=task_data["status"],
            priority=task_data["priority"],
            points=task_data["points"],
            tag_id=task_data["tag_id"],
            start_date=task_data["start_date"],
            due_date=task_data["due_date"],
        )