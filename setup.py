# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

version = "1.0.0"

with open("README.rst", "r") as fh:
    long_description = fh.read()

with open("docs/changelog.rst", "r") as fh:
    long_description += "\n\n"
    long_description += fh.read()

setup(
    name="senaite.collective.exportimport",
    version=version,
    description="collective.exportimport wrapper plugin for SENAITE",
    long_description=long_description,
    # long_description_content_type="text/markdown",
    # Get more strings from
    # http://pypi.python.org/pypi?:action=list_classifiers
    classifiers=[
        "Framework :: Plone",
        "Framework :: Zope2",
        "Programming Language :: Python",
        "License :: OSI Approved :: GNU General Public License v2 (GPLv2)",
    ],
    keywords=["senaite", "lims", "opensource"],
    author="Johannes Heinzl",
    author_email="jh.heinzl@gmail.com",
    url="https://github.com/jbravo94/senaite.collective.exportimport",
    license="GPLv2",
    packages=find_packages("src", exclude=["ez_setup"]),
    package_dir={"": "src"},
    namespace_packages=["senaite", "senaite.collective"],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "senaite.lims>=2.3.0",
        "collective.exportimport>=1.10",
    ],
    extras_require={
        "test": [
            "plone.app.testing",
            "unittest2",
        ]
    },
    entry_points="""
      # -*- Entry points: -*-
      [z3c.autoinclude.plugin]
      target = plone
      """,
)
