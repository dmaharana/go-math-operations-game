package main

import (
	"embed"
	"flag"
	"io/fs"
	"net/http"
	"strconv"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

type embedFS struct {
	http.FileSystem
}

const buildDir = "dist"

//go:embed dist
var staticFS embed.FS

func main() {
	port := flag.Int("port", 8080, "port number to listen on")
	flag.Parse()

	router := gin.Default()

	staticFileSubDir, err := fs.Sub(staticFS, buildDir)
	if err != nil {
		panic(err)
	}
	staticFileFS := http.FS(staticFileSubDir)
	router.Use(static.Serve("/", embedFS{staticFileFS}))

	router.Run(":" + strconv.Itoa(*port))
}

func (e embedFS) Exists(prefix string, name string) bool {
	f, err := e.Open(name)
	if err != nil {
		return false
	}
	f.Close()
	return true
}
