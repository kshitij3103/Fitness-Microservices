FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY ActivityService/pom.xml ActivityService/pom.xml
RUN mvn dependency:go-offline -B -f ActivityService/pom.xml
COPY ActivityService/src ActivityService/src
RUN mvn clean package -DskipTests -B -f ActivityService/pom.xml

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/ActivityService/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
