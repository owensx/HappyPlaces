from django import template
from django.template.defaultfilters import stringfilter
import ast
import re

register = template.Library()

DAYSABBREVMAP = {'S':'Sunday'
    ,'M':'Monday'
    ,'T':'Tuesday'
    ,'W':'Wednesday'
    ,'R':'Thursday'
    ,'F':'Friday'
    ,'Y':'Saturday'}

DAYSINTMAP = {'6':'Sunday'
    ,'0':'Monday'
    ,'1':'Tuesday'
    ,'2':'Wednesday'
    ,'3':'Thursday'
    ,'4':'Friday'
    ,'5':'Saturday'}

def intToDayOfWeek(value):
    for key, entry in DAYSABBREVMAP.items():
        if DAYSINTMAP[str(value)] == entry:
            return key

@register.filter(name='beautifyUrl')
@stringfilter
def beautifyUrl(value):
    value = value[7:] #strip http://
    value = value if not value.startswith('www') else value[4:] #strip www
    value = value if not value.endswith('/') else value[:len(value)-1] #strip trailing slash
    return value


@register.filter(name='beautifyDays')
def beautifyDays(value):
    output = '|  ';
    
    for dayString in ast.literal_eval(value):
        output += DAYSABBREVMAP[dayString] + '  |  '
        
    return output


@register.filter(name='formatStart')
# def formatStart(value):
#     if str(value) == '00:00:00':
#         return 'Midnight'
#     elif str(value) == '00:00:01':
#         return 'Open'        
#     else:
#         value = str(value)[1::-1][::-1]
#         value = int(value)
#         
#         value = value if value < 13 else value - 12
#         
#         return value

@register.filter(name='formatTime')
def formatTime(value):
    if str(value) == '00:00:00':
        return 'Midnight'
    elif str(value) == '00:00:01':
        return 'Open'        
    elif str(value) == '02:01:00':
        return 'Close'
    else:
        hoursValue = str(value)[:2]
        hoursValue = int(hoursValue)
        
        minutesValue = str(value)[3:5]
        
        ampm = 'pm' if hoursValue > 11 else 'am'
        
        hoursValue = hoursValue if hoursValue < 13 else hoursValue - 12
        
        if minutesValue == '00':
            return str(hoursValue)+ampm
        else:
            return str(hoursValue)+":"+minutesValue+ampm

@register.filter(name='formatTimeRange')
def formatTimeRange(start, end):
    if start == 'Open' and end=='Close':
        return 'All Day'
    else:
        return str(start) + '-' + str(end)
    
@register.filter(name='beautifyPhone')
def beautifyPhone(phone):
    phone = re.sub('[\(\.\)\-\s]','',phone)
    return phone

@register.filter(name='getMarkerInfo')
def getMarkerInfo(happyPlaces):
    return list(map(lambda happyPlace : happyPlace.markerInfo, happyPlaces))
def __str__(self):
        return self.happyPlace.name + ' ' + self.start.__str__() + ' - ' + self.end
