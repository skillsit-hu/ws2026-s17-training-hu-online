# Competition Overview

**International Online Training Competition for WorldSkills Shanghai 2026**
**04/28/2026 - 04/28/2026 | Online**

Submitted by: [Skills IT](https://skillsit.hu)

This competition has **four** separate tasks. Together they cover a self-contained frontend game, speed exercises, a REST content service (backend), and an LMS-style single-page frontend that consumes that API. Modules **A**, **C**, and **D** use the **SkillShare Academy** scenario and naming from the test project; see the linked module briefs for full requirements.

**Schedule (excerpt)**

| Day            | Module | Focus                                                     |
| -------------- | ------ | --------------------------------------------------------- |
| Tue 04/28 (C1) | **A**  | Frontend Game — **The Developer’s Learning Path**         |
| Tue 04/28 (C1) | **B**  | Speed test (HTML, CSS, JavaScript, TypeScript)            |
| Wed 04/29 (C2) | **C**  | Backend — SkillShare Academy **content service** REST API |
| Wed 04/29 (C2) | **D**  | Frontend — SkillShare Academy **LMS** (learning site) SPA |

Full timings (briefings, competition timwes, breaks) are in the [README](README.md).

**Marking totals** (from the published marking schemes): Module B **9** points; Modules A, C **30** points each, and D **30** points.

---

## Task descriptions (detail)

- [Module A - Frontend Game](module-a.md)
- [Module B - Speed Test](module-b.md)
- [Module C - Backend](module-c.md)
- [Module D - Frontend](module-d.md)

## Technical Environment

You can solve the tasks by developing them on your own machine.

### Gitea, git

The Gitea service is available at the following address: [https://git.ssa.skillsit.hu](https://git.ssa.skillsit.hu)

For **all four** tasks, you can start from a selected template repo on Gitea.

The available template repos:

- react-app
- react-ts-app
- vue-app
- vue-ts-app
- node-app
- node-ts-app
- laravel-app
- vanilla-js-app

To log in, you must use the username and password (a 4-digit PIN code) you have been given.
After logging in, create a new repo for the next task.

- In the Owner field, select `competitors` team! **Make sure you set this option carefully because if you set your own user as the owner, the automatic deployment will not work!**
- Give the name of the new repo using the following pattern: `module-X-Y`, where `X` is the module letter, and `Y` is your workstation number. **Make sure you set the repo's name carefully because if you make a mistake, the automatic deployment will not work!** _(Example: module-a-1)_
- Under the template field, select the appropriate template (e.g. `react-ts-app`). Select `Git Content (Default Branch)` for `Template Items`.

Once the new repo is created, clone it to your own workstation.

### Using npm modules

The npm modules will be accessible via a local npm cache. This means that even though there will be no internet access to the machines, you will be able to add the available npm modules to the projects as usual, and the `npm install` command issued on the cloned template projects will install all the npm modules needed for your project.

The available npm modules:

- express
- mysql2
- vue-router
- react-router, react-router-dom
- axios
- sass
- tailwindcss
- prisma, @prisma/client
- express-validator
- zod
- bootstrap
- _and all the types (`@types/`) needed for the TS projects_

### Laravel projects, composer install

The Laravel project contains all the necessary files, so you will not need to `composer install`. Your workstation has PHP 8 installed, so you can use the `php artisan` commands in the Laravel project.

### Deployment

When you commit and push your work, the deployment will start automatically. You can follow the process in the Gitea interface under the Action tab. Once the deployment is complete, your project will be available at `https://module-X-YYYY.ssa.skillsit.hu`, where `X` is the module letter and `YYYY` is your 4-digit PIN.

### Database access

You will have your own database on the MySQL database server (`db.ssa.skillsit.hu`) available on the local network. You will need to use this database for development, and the same database will provide the data for your projects deployed to the server. A database dump will be provided to get the initial data. During the marking, the database will be restored to its original state using the same dump. Your backend solution (Module C) uses this database.
