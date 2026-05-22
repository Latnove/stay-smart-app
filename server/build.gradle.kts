import java.util.Properties

plugins {
    id("java")
    id("org.springframework.boot") version "3.4.4"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.liquibase.gradle") version "2.2.2"
    id("org.openapi.generator") version "7.12.0"
    id("jacoco")
}

group = "io.staysmart"
version = "1.0-SNAPSHOT"

val postgresVersion: String by project
val lombokVersion: String by project
val jwtVersion: String by project

repositories {
    mavenCentral()
}

val openApiSpec = "$projectDir/src/main/resources/openapi/booking-api.yml"
val openApiGeneratedDir: String = layout.buildDirectory.dir("generated").get().asFile.absolutePath

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-mail")

    runtimeOnly("org.postgresql:postgresql:$postgresVersion")

    implementation("org.liquibase:liquibase-core")
    liquibaseRuntime("org.liquibase:liquibase-core")
    liquibaseRuntime("org.postgresql:postgresql:$postgresVersion")

    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6")

    implementation("io.jsonwebtoken:jjwt-api:$jwtVersion")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:$jwtVersion")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:$jwtVersion")

    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

val envProps = Properties()
val envFile = listOf(file("../.env"), file(".env")).firstOrNull { it.exists() }

if (envFile != null) {
    envFile.inputStream().use { envProps.load(it) }
}

fun envOrDefault(name: String, defaultValue: String): String {
    return System.getenv(name)
        ?: envProps.getProperty(name)
        ?: defaultValue
}

liquibase {
    activities.register("main") {
        arguments = mapOf(
            "changeLogFile" to envOrDefault("DB_CHANGE_LOG_FILE", "src/main/resources/db/changelog/changelog-master.yml"),
            "url" to envOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/staysmartdb"),
            "username" to envOrDefault("DB_USERNAME", "postgres"),
            "password" to envOrDefault("DB_PASSWORD", "postgres"),
            "driver" to envOrDefault("DB_DRIVER_CLASS_NAME", "org.postgresql.Driver"),
        )
    }
}

openApiGenerate {
    inputSpec.set(openApiSpec)
    outputDir.set(openApiGeneratedDir)
    generatorName.set("spring")
    modelPackage.set("io.staysmart.generated.booking.dto")
    apiPackage.set("io.staysmart.generated.booking.api")

    configOptions.set(
        mapOf(
            "useJakartaEe" to "true",
            "useSpringBoot3" to "true",
            "library" to "spring-boot",
            "interfaceOnly" to "true",
            "skipDefaultInterface" to "true",
            "useBeanValidation" to "true",
            "useTags" to "true",
            "dateLibrary" to "java8",
            "openApiNullable" to "false",
            "documentationProvider" to "none",
            "useResponseEntity" to "true"
        )
    )

    additionalProperties.set(
        mapOf(
            "generateApiTests" to "false",
            "generateModelTests" to "false",
            "generateApiDocumentation" to "false",
            "generateModelDocumentation" to "false"
        )
    )
}

sourceSets {
    getByName("main") {
        java {
            srcDir(layout.buildDirectory.dir("generated/src/main/java"))
        }
    }
}

tasks.named("compileJava") {
    dependsOn("openApiGenerate")
}

tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    environment("DEBUG", "false")

    envProps.stringPropertyNames().forEach { name ->
        if (System.getenv(name) == null) {
            environment(name, envProps.getProperty(name))
        }
    }
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

jacoco {
    toolVersion = "0.8.12"
}
