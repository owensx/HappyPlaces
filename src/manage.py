#!/usr/bin/env python

import os

import sys
sys.path.insert(0, "./")
sys.path.insert(0, "./venv/lib/python3.5/site-packages/")

import pymysql
pymysql.install_as_MySQLdb()

if __name__ == "__main__":
    from django.core.management import execute_from_command_line
    print(os.environ)
    execute_from_command_line(sys.argv)
