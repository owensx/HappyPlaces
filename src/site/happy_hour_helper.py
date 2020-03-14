from django.db.models import Q


def filter_on_time(happy_hours, time):
    return happy_hours.filter(Q(start__lte=time) & Q(end__gte=time))


def filter_on_days(happy_hours, days):
    return happy_hours.filter(get_days_criteria(days))


def get_days_criteria(days):
    criteria = Q()

    if 'M' in days:
        criteria = criteria | Q(monday=True)
    if 'T' in days:
        criteria = criteria | Q(tuesday=True)
    if 'W' in days:
        criteria = criteria | Q(wednesday=True)
    if 'R' in days:
        criteria = criteria | Q(thursday=True)
    if 'F' in days:
        criteria = criteria | Q(friday=True)
    if 'S' in days:
        criteria = criteria | Q(saturday=True)
    if 'Y' in days:
        criteria = criteria | Q(sunday=True)

    return criteria
