#### 0.9.16 (2020-04-16)

#### 0.9.15 (2020-03-30)

#### 0.9.14 (2020-03-06)

#### 0.9.13 (2020-02-28)

#### 0.9.12 (2020-02-16)

#### 0.9.11 (2020-02-04)

#### 0.9.10 (2020-01-24)

#### 0.9.9 (2020-01-22)

#### 0.9.8 (2020-01-17)

#### 0.9.7 (2020-01-14)

#### 0.9.6 (2020-01-12)

#### 0.9.5 (2019-12-17)

#### 0.9.4 (2019-11-20)

#### 0.9.3 (2019-11-14)

#### 0.9.2 (2019-10-23)

#### 0.9.1 (2019-10-14)

#### 0.9.0 (2019-10-14)

##### Chores

* **examples:**
  *  improve usage example ([89e590a1](https://github.com/lykmapipo/mongoose-kue/commit/89e590a1769f85cf5e46de6d701fadaeb0e630b5))
  *  setup main and worker samples ([8c7a817c](https://github.com/lykmapipo/mongoose-kue/commit/8c7a817c3cc63029baa42db68608cdcde9606768))
* **deps:**
  *  force latest versions ([ee21453f](https://github.com/lykmapipo/mongoose-kue/commit/ee21453f10ea44a3dc861c19c1ef4a0b58fa0f18))
  *  force latest version & audit fix ([21a2073c](https://github.com/lykmapipo/mongoose-kue/commit/21a2073cfce2a9764e24651ddd9c652936e1d8fe))

##### Documentation Changes

* **changelog:**  generate latest release notes ([e48d4400](https://github.com/lykmapipo/mongoose-kue/commit/e48d4400fbf30d6bf7321a89e585752c7fa0ca6d))

##### New Features

*  allow run defined jobs ([f0d60319](https://github.com/lykmapipo/mongoose-kue/commit/f0d60319fb11d94bc04234d3e9cdd1b8655f24b6))

##### Bug Fixes

* **worker:**  ensure queue name on job creation ([96b9d691](https://github.com/lykmapipo/mongoose-kue/commit/96b9d6910c896137b803bb8045af3f4f44ea83eb))

##### Refactors

* **plugin:**  remove dangling underscore ([f09ca8b6](https://github.com/lykmapipo/mongoose-kue/commit/f09ca8b6f8b67b179fc17949697cca67be16b3ce))
*  specify path on import ([2ba9a49d](https://github.com/lykmapipo/mongoose-kue/commit/2ba9a49da63175127c4f57c3a9ede02a23dc6602))

#### 0.8.9 (2019-10-10)

#### 0.8.8 (2019-09-28)

#### 0.8.7 (2019-09-26)

#### 0.8.6 (2019-09-16)

#### 0.8.5 (2019-08-14)

#### 0.8.4 (2019-07-09)

#### 0.8.3 (2019-06-19)

#### 0.8.2 (2019-06-10)

#### 0.8.1 (2019-05-29)

#### 0.8.0 (2019-05-28)

##### Chores

* **deps:**  force latest version & audit fix ([e5cf8c47](https://github.com/lykmapipo/mongoose-kue/commit/e5cf8c473716da97055e5214d8794d9a767f8ec0))

##### Documentation Changes

* **changelog:**  generate latest release notes ([99b2094f](https://github.com/lykmapipo/mongoose-kue/commit/99b2094f229eb250bc744a458e0f51132d64021f))

##### New Features

*  implement queue clear ([bef750ac](https://github.com/lykmapipo/mongoose-kue/commit/bef750acf27889e8a5c7680d0beb661b08df6835))

##### Refactors

*  use kue common stop on reset ([c7b08a34](https://github.com/lykmapipo/mongoose-kue/commit/c7b08a34ab2c7de4f44753f4c741003a177af981))
*  improve plugin to remove falsey values on merge ([b87b6986](https://github.com/lykmapipo/mongoose-kue/commit/b87b6986198d11213cee46da13e9a0c0729a9551))
*  use mongoose connection helper & kue createQueue helpers ([9ce0619f](https://github.com/lykmapipo/mongoose-kue/commit/9ce0619fe9791b27728da87bb923a7c911d41879))
*  remove unused default options ([aad70072](https://github.com/lykmapipo/mongoose-kue/commit/aad700729bb673b127201d66fc55d7cc6081af37))
*  use connection and queue helpers on init ([7a45785e](https://github.com/lykmapipo/mongoose-kue/commit/7a45785efb1e734431496df8274302b71bd24db0))

##### Code Style Changes

*  improve code styles ([8a69519b](https://github.com/lykmapipo/mongoose-kue/commit/8a69519b79639f829b67565a850427b63cbf39c8))

##### Tests

*  refactor to allow re-initialize per context ([12cbb61b](https://github.com/lykmapipo/mongoose-kue/commit/12cbb61b2d69cf5ea087f8de53754f3093ca14fa))
*  refactor bootstrap using test helpers and utilities ([3e008cd7](https://github.com/lykmapipo/mongoose-kue/commit/3e008cd72c1be9fd4fdb61c715daeec44d6ce155))
* **worker:**
  *  refactor to improve readability ([894ad052](https://github.com/lykmapipo/mongoose-kue/commit/894ad0525d35bc5f1d5e12746d4cc6dfa278fb8f))
  *  use arrow and improve code style ([fcca0f90](https://github.com/lykmapipo/mongoose-kue/commit/fcca0f90cd8c6f7a9d6d205ba05c4268bc998130))

#### 0.7.4 (2019-05-20)

#### 0.7.3 (2019-05-12)

#### 0.7.2 (2019-04-16)

##### Chores

*  force latest dependencies ([85f03c8e](https://github.com/lykmapipo/mongoose-kue/commit/85f03c8e6a1a1718bde1b754f0fa41ea7aaced63))

##### Documentation Changes

*  add code of conduct and contributing guide ([f6863c39](https://github.com/lykmapipo/mongoose-kue/commit/f6863c394f63d575110f63f3247077ca8420a510))

##### Refactors

*  use latest env ([edba1cdd](https://github.com/lykmapipo/mongoose-kue/commit/edba1cddd4204c1046cfd4c5f74b872b6906a417))

