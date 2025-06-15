# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 80


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["server/RestaurantQuangQuy/RestaurantQuangQuy/RestaurantQuangQuy.csproj", "server/RestaurantQuangQuy/RestaurantQuangQuy/"]
RUN dotnet restore "server/RestaurantQuangQuy/RestaurantQuangQuy/RestaurantQuangQuy.csproj"

# Copy the rest of the code
COPY . .
WORKDIR "/src/server/RestaurantQuangQuy/RestaurantQuangQuy"

# Build and publish
RUN dotnet build "RestaurantQuangQuy.csproj" -c Release -o /app/build
RUN dotnet publish "RestaurantQuangQuy.csproj" -c Release -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app

# Copy published files from build stage
COPY --from=build /app/publish .

# Start the application
ENTRYPOINT ["dotnet", "RestaurantQuangQuy.dll"]