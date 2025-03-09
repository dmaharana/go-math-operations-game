package main

import (
	"embed"
	"flag"
	"io/fs"
	"net/http"

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
	var port string
	flag.StringVar(&port, "port", "8080", "port")
	flag.StringVar(&port, "p", "8080", "port")
	flag.Parse()

	router := gin.Default()

	staticFileSubDir, err := fs.Sub(staticFS, buildDir)
	if err != nil {
		panic(err)
	}
	staticFileFS := http.FS(staticFileSubDir)
	router.Use(static.Serve("/", embedFS{staticFileFS}))

	router.Run(":" + port)
}

func (e embedFS) Exists(prefix string, name string) bool {
	f, err := e.Open(name)
	if err != nil {
		return false
	}
	f.Close()
	return true
}
