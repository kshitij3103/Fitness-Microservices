FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY UserService/pom.xml UserService/pom.xml
RUN mvn dependency:go-offline -B -f UserService/pom.xml
COPY UserService/src UserService/src
RUN mvn clean package -DskipTests -B -f UserService/pom.xml

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/UserService/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
